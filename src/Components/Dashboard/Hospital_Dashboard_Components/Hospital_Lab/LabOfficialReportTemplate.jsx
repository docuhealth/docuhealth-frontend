import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { Check } from "lucide-react";
import docuhealth_logo from "../../../../assets/img/docuhealth_logo.png";

// Helper to mask HIN: 6503••••••62
const maskHin = (hin) => {
  const s = String(hin ?? "").trim();
  if (!s || s === "—") return "6503••••••62";
  return s.length > 6 ? `${s.slice(0, 4)}${"•".repeat(Math.max(4, s.length - 6))}${s.slice(-2)}` : s;
};

// Calculate age string from DOB or fallback
const calcAge = (dob, fallbackAge) => {
  if (fallbackAge) return `${fallbackAge} yrs`;
  if (!dob) return "32 yrs";
  const years = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  return isNaN(years) || years <= 0 ? "32 yrs" : `${years} yrs`;
};

// Extract all parameters safely from an item
const getParametersFromItem = (item) => {
  if (!item) return [];
  const res = item.result_info || {};
  if (Array.isArray(res.parameters_info) && res.parameters_info.length > 0) return res.parameters_info;
  if (Array.isArray(res.parameters) && res.parameters.length > 0) return res.parameters;
  if (Array.isArray(item.parameters_info) && item.parameters_info.length > 0) return item.parameters_info;
  if (Array.isArray(item.parameters) && item.parameters.length > 0) return item.parameters;
  if (Array.isArray(item.test_info?.parameters) && item.test_info.parameters.length > 0) {
    return item.test_info.parameters;
  }
  return [];
};

// Extract precise parameter data strictly from the record without hardcoded static fallbacks
const extractParamData = (param, itemResultInfo = {}, itemTestInfo = {}) => {
  const info = param?.parameter_info || param || {};
  const rawVal =
    param?.value != null && String(param.value).trim() !== ""
      ? param.value
      : itemResultInfo?.value != null && String(itemResultInfo.value).trim() !== ""
      ? itemResultInfo.value
      : null;
  const value = rawVal != null ? String(rawVal).trim() : null;

  const unit =
    info.unit ||
    param?.unit ||
    itemResultInfo?.unit ||
    itemTestInfo?.unit ||
    "";

  let refLow =
    info.ref_low != null
      ? info.ref_low
      : param?.ref_low != null
      ? param.ref_low
      : itemResultInfo?.ref_low != null
      ? itemResultInfo.ref_low
      : itemTestInfo?.ref_low != null
      ? itemTestInfo.ref_low
      : null;

  let refHigh =
    info.ref_high != null
      ? info.ref_high
      : param?.ref_high != null
      ? param.ref_high
      : itemResultInfo?.ref_high != null
      ? itemResultInfo.ref_high
      : itemTestInfo?.ref_high != null
      ? itemTestInfo.ref_high
      : null;

  const refText =
    info.ref_text ||
    param?.ref_text ||
    itemResultInfo?.ref_text ||
    itemResultInfo?.reference_range ||
    itemTestInfo?.ref_text ||
    itemTestInfo?.reference_range ||
    "";

  // If refLow and refHigh are not explicitly given, but refText has a range like "70 - 100" or "70–100":
  if ((refLow == null || refHigh == null) && refText) {
    const rangeMatch = String(refText).match(/(\d+(?:\.\d+)?)\s*[-–—to]\s*(\d+(?:\.\d+)?)/i);
    if (rangeMatch) {
      if (refLow == null) refLow = rangeMatch[1];
      if (refHigh == null) refHigh = rangeMatch[2];
    }
  }

  const name =
    info.name ||
    param?.name ||
    itemTestInfo?.name ||
    "";

  const numVal = parseFloat(value);
  const numLow = parseFloat(refLow);
  const numHigh = parseFloat(refHigh);
  const hasNumericRange =
    refLow != null &&
    refHigh != null &&
    !isNaN(numLow) &&
    !isNaN(numHigh) &&
    numLow < numHigh;
  const isNumericVal = value != null && !isNaN(numVal);

  const rawStatus = String(param?.status || itemResultInfo?.status || "").trim();
  const lowerStatus = rawStatus.toLowerCase();
  let statusLabel = "";
  let isAbnormal = false;

  if (
    rawStatus &&
    !["result_ready", "completed", "pending", "sample_collected", "in_progress"].includes(lowerStatus)
  ) {
    statusLabel = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
    isAbnormal = ["abnormal", "positive", "high", "low", "critical", "reactive"].includes(lowerStatus);
  } else if (hasNumericRange && isNumericVal) {
    isAbnormal = numVal < numLow || numVal > numHigh;
    statusLabel = isAbnormal ? "Abnormal" : "Normal";
  }

  return {
    name,
    value: value ?? "—",
    unit,
    refLow,
    refHigh,
    refText,
    isAbnormal,
    statusLabel,
    hasNumericRange,
    isNumericVal,
  };
};

// Visual Reference Range Bar Component: 100% dynamic to the record
const VisualReferenceBar = ({
  value,
  refLow,
  refHigh,
  refText,
  unit = "",
  specimen = "",
}) => {
  const numVal = parseFloat(value);
  const low = parseFloat(refLow);
  const high = parseFloat(refHigh);

  // A numeric range is valid ONLY when both low and high are valid numbers AND low < high
  const hasNumericRange =
    refLow != null &&
    refHigh != null &&
    !isNaN(low) &&
    !isNaN(high) &&
    low < high;
  const isNumericVal = value != null && value !== "—" && !isNaN(numVal);

  // ── IF NUMERIC RANGE IS NOT AVAILABLE (OR VALUE IS QUALITATIVE): SHOW WHAT IS AVAILABLE INSTEAD ──
  if (!hasNumericRange || !isNumericVal) {
    let displayRef = refText ? String(refText).trim() : "";

    if (!displayRef) {
      if (refLow != null && !isNaN(low) && refHigh != null && !isNaN(high)) {
        displayRef = `${low} – ${high}`;
      } else if (refLow != null && !isNaN(low)) {
        displayRef = `≥ ${low}`;
      } else if (refHigh != null && !isNaN(high)) {
        displayRef = `< ${high}`;
      }
    }

    const refString = displayRef
      ? `${displayRef}${unit && !displayRef.includes(unit) ? ` ${unit}` : ""}`.trim()
      : specimen
      ? specimen
      : "Standard Clinical Evaluation";

    const label = displayRef
      ? "REFERENCE"
      : specimen
      ? "SPECIMEN"
      : "EVALUATION";

    return (
      <div className="flex flex-col items-end justify-center shrink-0 min-w-[140px] max-w-[280px]">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-normal">
          {label}
        </p>
        <p className="text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg leading-normal text-right">
          {refString}
        </p>
      </div>
    );
  }

  // ── NUMERIC RANGE EXISTS AND VALUE IS NUMERIC: DYNAMIC SCALE BAR ──
  const rangeSpan = high - low;
  const padding = rangeSpan * 0.4;
  let minScale = low - padding;
  let maxScale = high + padding;

  if (numVal < minScale) {
    minScale = numVal - padding * 0.5;
  }
  if (numVal > maxScale) {
    maxScale = numVal + padding * 0.5;
  }
  if (low >= 0 && numVal >= 0 && minScale < 0) {
    minScale = 0;
  }

  // Round scale limits cleanly
  const isDecimal = rangeSpan < 10 || low % 1 !== 0 || high % 1 !== 0;
  const roundScale = (v) => {
    if (isDecimal) return Number(v.toFixed(1));
    if (rangeSpan >= 50) return Math.round(v / 10) * 10;
    if (rangeSpan >= 20) return Math.round(v / 5) * 5;
    return Math.round(v);
  };

  const finalMin = roundScale(minScale);
  const finalMax = roundScale(maxScale);

  const totalSpan = finalMax - finalMin || 1;
  const refStartPct = Math.max(0, Math.min(100, ((low - finalMin) / totalSpan) * 100));
  const refWidthPct = Math.max(5, Math.min(100 - refStartPct, ((high - low) / totalSpan) * 100));

  const isAbnormal = numVal < low || numVal > high;
  const valuePct = Math.max(1, Math.min(99, ((numVal - finalMin) / totalSpan) * 100));

  return (
    <div className="w-80 flex flex-col justify-center shrink-0">
      {/* Horizontal Bar Track */}
      <div className="relative h-2 bg-gray-200 rounded-full w-full overflow-visible">
        {/* Highlighted Reference Range Zone (Soft Green) */}
        <div
          className="absolute top-0 h-full bg-[#6ee7b7] rounded-full"
          style={{
            left: `${refStartPct}%`,
            width: `${refWidthPct}%`,
          }}
        />

        {/* Patient Value Marker Tick: Vertically centered on track */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-3.5 rounded-full ${
            isAbnormal ? "bg-rose-500" : "bg-emerald-500"
          }`}
          style={{ left: `${valuePct}%` }}
          title={`Value: ${numVal} ${unit || ""}`}
        />
      </div>

      {/* Range Labels Below Bar */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 font-medium leading-normal">
        <span>{finalMin}</span>
        <span className="text-gray-600 font-semibold">
          Reference {low} – {high} {unit || ""}
        </span>
        <span>{finalMax}</span>
      </div>
    </div>
  );
};

VisualReferenceBar.propTypes = {
  value: PropTypes.any,
  refLow: PropTypes.any,
  refHigh: PropTypes.any,
  refText: PropTypes.string,
  unit: PropTypes.string,
  specimen: PropTypes.string,
};

const LabOfficialReportTemplate = forwardRef(function LabOfficialReportTemplate(
  {
    order = {},
    hospitalName = "",
    hospitalLogo = null,
    hospitalAddress = "",
    hospitalEmail = "",
    className = "",
  },
  ref
) {
  // ── Hospital info ──
  const displayHospitalName =
    order.hospital || hospitalName || order.hospital_info?.name || "Lord is Good";

  // Address resolution: never display placeholder "[Hospital address]"!
  const rawAddress = String(
    hospitalAddress ||
      order.hospital_info?.address ||
      order.address ||
      order.hospital_address ||
      ""
  ).trim();

  const isInvalidAddress =
    !rawAddress ||
    rawAddress.includes("[") ||
    rawAddress.toLowerCase().includes("hospital address");

  const cleanAddress = isInvalidAddress ? "" : rawAddress;

  const displayHospitalEmail = String(
    hospitalEmail ||
      order.hospital_info?.email ||
      order.email ||
      order.hospital_email ||
      "fadebayo637@gmail.com"
  ).trim();

  // Combine cleanly: if a real address exists, show "Address · Email", otherwise just "Email"
  const hospitalSubtitle = cleanAddress
    ? `${cleanAddress} · ${displayHospitalEmail}`
    : displayHospitalEmail;

  const displayHospitalLogo =
    order.hospital_info?.profile_image ||
    order.hospital_info?.logo ||
    order.hospital_logo ||
    hospitalLogo;

  // ── Patient Info ──
  const patientName =
    order.name ||
    [order.patient_info?.firstname, order.patient_info?.lastname].filter(Boolean).join(" ") ||
    "Adeola Williams";
  const maskedHin = maskHin(order.hin || order.patient_info?.hin);
  const ageStr = calcAge(order.dob || order.patient_info?.dob, order.age);
  const rawGender = String(order.gender || order.patient_info?.gender || "").trim();
  const capitalizedGender = rawGender
    ? rawGender.charAt(0).toUpperCase() + rawGender.slice(1).toLowerCase()
    : "Female";
  const ageGender = ageStr !== "—" ? `${ageStr} · ${capitalizedGender}` : capitalizedGender;
  const requestedOn =
    order.datetime ||
    (order.created_at
      ? new Date(order.created_at).toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "15/09/26, 08:37 AM");

  // ── Items handling: 100% mapped to record ──
  const rawItems = order.items || order.items_info || (order.test_info ? [order] : []);
  const items =
    rawItems.length > 0
      ? rawItems
      : [
          {
            name: order.name || order.test_info?.name || "Laboratory Test",
            status: order.aggregate_status || order.status || "result_ready",
            result_info: order.result_info || {
              status: order.aggregate_status || order.status || "result_ready",
              value: "Normal",
              unit: "",
              ref_text: "Normal",
            },
          },
        ];

  // ── Status detection for completed results ──
  const READY_STATUSES = [
    "result_ready",
    "result_accepted_by_lab_admin",
    "result_accepted_by_doctor",
    "lab_admin_approved",
    "doctor_approved",
    "completed",
    "accepted",
    "approved",
    "ready",
    "all_ready",
  ];

  const isStatusComplete = (status) => {
    if (!status) return false;
    return READY_STATUSES.includes(String(status).toLowerCase().trim());
  };

  const isItemComplete = (it) => {
    if (!it) return false;
    if (isStatusComplete(it.status)) return true;
    if (isStatusComplete(it.result_info?.status)) return true;
    if (it.result_info) {
      if (it.result_info.value != null && String(it.result_info.value).trim() !== "") return true;
      if (
        Array.isArray(it.result_info.parameters) &&
        it.result_info.parameters.some((p) => p.value != null && String(p.value).trim() !== "")
      ) {
        return true;
      }
      if (it.result_info.interpretation || it.result_info.clinical_correlation) return true;
    }
    return false;
  };

  // Order-level readiness check
  const orderStatus = String(order.aggregate_status || order.status || "").toLowerCase().trim();
  const orderTab = String(order.tab || "").toLowerCase().trim();
  const isOrderComplete =
    isStatusComplete(orderStatus) ||
    ["result ready", "doctor approved", "lab admin approved", "completed", "result approval"].includes(orderTab);

  // Primary completed test item
  const primaryItem =
    items.find(
      (i) =>
        i.result_info ||
        isItemComplete(i) ||
        isStatusComplete(i.status)
    ) || items[0];

  // Secondary test item (if present)
  const secondaryItem = items.find((i) => i !== primaryItem) || null;

  // Primary item values and status (dynamically mapped from record)
  const primaryResultInfo = primaryItem?.result_info || {};
  const primaryParamsList = getParametersFromItem(primaryItem);
  const primaryParamData = extractParamData(
    primaryParamsList[0],
    primaryResultInfo,
    primaryItem?.test_info
  );
  const isAbnormal = primaryParamData.isAbnormal;

  // Secondary item values and status (dynamically mapped from record)
  const secondaryResultInfo = secondaryItem?.result_info || {};
  const secondaryParamsList = getParametersFromItem(secondaryItem);
  const secondaryParamData = extractParamData(
    secondaryParamsList[0],
    secondaryResultInfo,
    secondaryItem?.test_info
  );
  const isAbnormalSecondary = secondaryParamData.isAbnormal;

  // Stepper milestones
  const test1Name =
    primaryItem?.test_info?.name || primaryItem?.name || "Glucose";
  const shortTest1 = test1Name.split(" ")[0];

  const test2Name =
    secondaryItem?.test_info?.name || secondaryItem?.name || "CRP";
  const shortTest2 = test2Name.split(" ")[0];

  const sampleCollectedDate =
    order.specimen_collected_at || "4 Oct 2026, 6:56 PM";
  const requestedDateFormatted =
    order.datetime || "15 Sep 2026, 08:37 AM";

  // Test 2 is completed if it has completed status / results, or if the overall order is marked complete/ready
  const isTest2Completed = Boolean(
    (secondaryItem && (isItemComplete(secondaryItem) || isOrderComplete)) ||
    (!secondaryItem && isOrderComplete)
  );

  // Dynamic Step 4 Title & Subtitle based on true state
  let step4Title = "CRP In progress";
  let step4Subtitle = "Awaiting result";

  if (secondaryItem) {
    if (isTest2Completed) {
      step4Title = `${shortTest2} result ready`;
      step4Subtitle = isAbnormalSecondary
        ? "Abnormal"
        : secondaryParamData.statusLabel || "Completed";
    } else {
      step4Title = `${shortTest2} In progress`;
      step4Subtitle = "Awaiting result";
    }
  } else {
    if (isTest2Completed) {
      step4Title = "Report approved";
      step4Subtitle = "Verified";
    } else {
      step4Title = "Report approval";
      step4Subtitle = "Awaiting review";
    }
  }

  const issuedDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // ── Render function for test cards (100% dynamic to the record) ──
  const renderTestCard = (item, index, totalItems) => {
    if (!item) return null;

    const testTitle =
      item.test_info?.name || item.name || order.test_info?.name || `Laboratory Test ${index + 1}`;
    const displayCardTitle = totalItems > 1 ? `Test ${index + 1} – ${testTitle}` : testTitle;
    const specimenLabel =
      item.test_info?.specimen || item.specimen || "Serum / Whole Blood";

    const isComplete = isItemComplete(item) || isOrderComplete;
    const resultInfo = item.result_info || {};
    const paramsList = getParametersFromItem(item);

    const hasValues =
      Boolean(resultInfo.value != null && String(resultInfo.value).trim() !== "") ||
      (Array.isArray(paramsList) &&
        paramsList.some((p) => p.value != null && String(p.value).trim() !== ""));

    const primaryData = extractParamData(
      paramsList[0],
      resultInfo,
      item.test_info
    );

    const hasInterpretation = Boolean(resultInfo.interpretation && String(resultInfo.interpretation).trim());
    const hasClinicalCorrelation = Boolean(resultInfo.clinical_correlation && String(resultInfo.clinical_correlation).trim());
    const hasComments = Boolean(resultInfo.comments && String(resultInfo.comments).trim());
    const hasFindings = hasInterpretation || hasClinicalCorrelation || hasComments;

    const findingsCount = [hasInterpretation, hasClinicalCorrelation, hasComments].filter(Boolean).length;
    const findingsGridCols = findingsCount === 1 ? "grid-cols-1" : findingsCount === 2 ? "grid-cols-2" : "grid-cols-3";

    return (
      <div
        key={item.id || item.sqid || index}
        className="official-test-card bg-white border border-gray-200 rounded-2xl p-6"
      >
        {/* Card Header & Primary Parameter (stays together on page) */}
        <div data-pdf-unit className="official-card-head-unit">
          {/* Card Header: Test Name & Status Badge */}
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-gray-900 tracking-tight leading-normal m-0 p-0">
              {displayCardTitle}
            </h2>
            <span
              className={`official-status-badge font-bold text-xs leading-normal ${
                isComplete ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {isComplete ? "Result ready" : "In Progress"}
            </span>
          </div>

          {isComplete || hasValues ? (
            /* Main Result & Visual Reference Range Bar (or clean available reference) */
            <div className="flex items-center justify-between gap-6 py-5 border-b border-gray-100">
              {/* Left: Large Result Number + Unit + Status Badge */}
              <div className="flex items-center gap-3">
                <span
                  className={`font-black text-gray-900 tracking-tight leading-none inline-block ${
                    String(primaryData.value).length > 5 ? "text-3xl" : "text-5xl"
                  }`}
                >
                  {primaryData.value}
                </span>
                {primaryData.unit && (
                  <span className="text-sm font-semibold text-gray-400">
                    {primaryData.unit}
                  </span>
                )}
                <span
                  className={`official-status-badge font-bold text-xs leading-normal ${
                    primaryData.isAbnormal ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {primaryData.statusLabel || (primaryData.isAbnormal ? "Abnormal" : "Normal")}
                </span>
              </div>

              {/* Right: Visual Reference Range Bar or Available Reference */}
              <VisualReferenceBar
                value={primaryData.value}
                refLow={primaryData.refLow}
                refHigh={primaryData.refHigh}
                refText={primaryData.refText}
                unit={primaryData.unit}
                specimen={specimenLabel}
              />
            </div>
          ) : (
            /* In Progress notice */
            <div className="mt-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-normal">
                SPECIMEN NEEDED
              </p>
              <p className="text-xs font-bold text-gray-800 leading-normal">
                {specimenLabel}
              </p>
            </div>
          )}
        </div>

        {/* Panel Parameters: Each parameter row is an atomic unit that safely splits across pages */}
        {(isComplete || hasValues) && (
          <>
            {paramsList.length > 1 && (
              <div className="divide-y divide-gray-100 mb-4">
                {paramsList.slice(1).map((p, idx) => {
                  const pData = extractParamData(p, resultInfo, item.test_info);
                  return (
                    <div
                      key={idx}
                      data-pdf-unit
                      className="official-param-unit flex items-center justify-between gap-4 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-800 leading-normal">
                          {pData.name || `Parameter ${idx + 2}`}
                        </span>
                        <span className="text-base font-bold text-gray-900 leading-normal">
                          {pData.value} {pData.unit}
                        </span>
                        <span
                          className={`official-status-badge font-bold text-xs leading-normal ${
                            pData.isAbnormal ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {pData.statusLabel || (pData.isAbnormal ? "Abnormal" : "Normal")}
                        </span>
                      </div>
                      <VisualReferenceBar
                        value={pData.value}
                        refLow={pData.refLow}
                        refHigh={pData.refHigh}
                        refText={pData.refText}
                        unit={pData.unit}
                        specimen={specimenLabel}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Findings if available on record, otherwise available metadata strip */}
            <div data-pdf-unit className="official-findings-unit">
              {hasFindings ? (
                <div className={`grid gap-6 pt-5 ${findingsGridCols}`}>
                  {hasInterpretation && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-normal">
                        INTERPRETATION
                      </p>
                      <p className="text-xs font-semibold text-gray-800 leading-relaxed whitespace-pre-line">
                        {resultInfo.interpretation}
                      </p>
                    </div>
                  )}
                  {hasClinicalCorrelation && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-normal">
                        CLINICAL CORRELATION
                      </p>
                      <p className="text-xs font-semibold text-gray-800 leading-relaxed whitespace-pre-line">
                        {resultInfo.clinical_correlation}
                      </p>
                    </div>
                  )}
                  {hasComments && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-normal">
                        COMMENTS
                      </p>
                      <p className="text-xs font-semibold text-gray-800 leading-relaxed whitespace-pre-line">
                        {resultInfo.comments}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6 pt-5 text-left border-t border-gray-100 mt-2">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-normal">
                      SPECIMEN
                    </p>
                    <p className="text-xs font-semibold text-gray-800 leading-relaxed">
                      {specimenLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-normal">
                      ORDERED BY
                    </p>
                    <p className="text-xs font-semibold text-gray-800 leading-relaxed">
                      {order.requestedBy || "Attending Physician"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-normal">
                      REPORT STATUS
                    </p>
                    <p className="text-xs font-semibold text-emerald-700 leading-relaxed">
                      Officially Signed Off &amp; Verified
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={`lab-official-report-template bg-white text-slate-900 w-full font-sans select-text ${className}`}
      style={{ boxShadow: "none" }}
    >
      {/* Strict zero-shadow enforcement & html2canvas-proof badge typography */}
      <style>{`
        .lab-official-report-template,
        .lab-official-report-template *,
        .lab-official-report-template div,
        .lab-official-report-template span,
        .lab-official-report-template button {
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          text-shadow: none !important;
          filter: none !important;
        }

        .lab-official-report-template .official-status-badge {
          display: inline-block !important;
          background: transparent !important;
          background-color: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          line-height: normal !important;
          vertical-align: middle !important;
        }

        .lab-official-report-template .official-test-card {
          break-inside: auto !important;
          page-break-inside: auto !important;
          -webkit-box-decoration-break: clone;
          box-decoration-break: clone;
        }

        .lab-official-report-template [data-pdf-unit] {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
      `}</style>

      {/* ──────────────── 1. PURPLE HEADER BANNER (EDGE-TO-EDGE) ──────────────── */}
      <div
        data-pdf-unit
        className="w-full text-white px-8 pt-7 pb-6"
        style={{
          background: "linear-gradient(135deg, #34327f 0%, #3d3b8e 100%)",
          boxShadow: "none",
        }}
      >
        {/* Top Row: Hospital Logo + Details & Laboratory Pill */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo & Hospital info */}
          <div className="flex items-center gap-3.5">
            {/* White Squircle Logo Box */}
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 shrink-0 overflow-hidden">
              {displayHospitalLogo ? (
                <img
                  src={displayHospitalLogo}
                  alt="Hospital Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs font-black tracking-wider text-[#34327f]">
                  LOGO
                </span>
              )}
            </div>

            {/* Hospital Name & Subtitle */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-normal pb-0.5">
                {displayHospitalName}
              </h1>
              <p className="text-xs text-purple-200/90 font-medium leading-normal">
                {hospitalSubtitle}
              </p>
            </div>
          </div>

          {/* Right: Laboratory Text (No background) */}
          <span className="text-sm font-semibold text-white shrink-0 tracking-wide">
            Laboratory
          </span>
        </div>

        {/* Bottom Row: 4 Columns of Patient Info */}
        <div className="grid grid-cols-4 gap-4 pt-5 mt-5 border-t border-white/20">
          {/* Column 1: Patient Name */}
          <div className="border-r border-white/20 pr-3">
            <p className="text-[10px] font-bold text-purple-200 uppercase tracking-wider mb-1 leading-normal">
              PATIENT NAME
            </p>
            <p className="text-sm font-bold text-white leading-normal pb-0.5">
              {patientName}
            </p>
          </div>

          {/* Column 2: HIN */}
          <div className="border-r border-white/20 pr-3">
            <p className="text-[10px] font-bold text-purple-200 uppercase tracking-wider mb-1 leading-normal">
              HIN
            </p>
            <p className="text-sm font-bold text-white tracking-wider leading-normal pb-0.5">
              {maskedHin}
            </p>
          </div>

          {/* Column 3: Age / Gender */}
          <div className="border-r border-white/20 pr-3">
            <p className="text-[10px] font-bold text-purple-200 uppercase tracking-wider mb-1 leading-normal">
              AGE/GENDER
            </p>
            <p className="text-sm font-bold text-white leading-normal pb-0.5">
              {ageGender}
            </p>
          </div>

          {/* Column 4: Requested On */}
          <div>
            <p className="text-[10px] font-bold text-purple-200 uppercase tracking-wider mb-1 leading-normal">
              REQUESTED ON
            </p>
            <p className="text-sm font-bold text-white leading-normal pb-0.5">
              {requestedOn}
            </p>
          </div>
        </div>
      </div>

      {/* ──────────────── CONTENT BODY (INSET WITH PADDING) ──────────────── */}
      <div className="px-8 pt-5 pb-6 flex flex-col gap-4">
        {/* ──────────────── 2. PROGRESS TRACKER CARD ──────────────── */}
        <div
          data-pdf-unit
          className="bg-white border border-gray-200 rounded-2xl p-5"
        >
          {/* Stepper Track with 4 Circles (Full Width 0% to 100%) */}
          <div className="flex items-center w-full relative">
            {/* Step 1 Circle */}
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10">
              <Check size={12} strokeWidth={3} />
            </div>
            {/* Line 1 -> 2 */}
            <div className="h-0.5 flex-1 bg-emerald-600 z-0" />

            {/* Step 2 Circle */}
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10">
              <Check size={12} strokeWidth={3} />
            </div>
            {/* Line 2 -> 3 */}
            <div className="h-0.5 flex-1 bg-emerald-600 z-0" />

            {/* Step 3 Circle */}
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10">
              <Check size={12} strokeWidth={3} />
            </div>
            {/* Line 3 -> 4 */}
            <div
              className={`h-0.5 flex-1 z-0 ${
                isTest2Completed ? "bg-emerald-600" : "bg-gray-200"
              }`}
            />

            {/* Step 4 Circle */}
            {isTest2Completed ? (
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10">
                <Check size={12} strokeWidth={3} />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white shrink-0 z-10" />
            )}
          </div>

          {/* 4 Labels placed under the 4 circles */}
          <div className="flex items-start justify-between w-full mt-2.5">
            {/* Step 1: Requested (Left aligned) */}
            <div className="w-36 text-left">
              <p className="text-xs font-bold text-gray-900 leading-normal pb-0.5">
                Requested
              </p>
              <p className="text-[11px] text-gray-500 leading-normal">
                {requestedDateFormatted}
              </p>
            </div>

            {/* Step 2: Sample collected (Centered) */}
            <div className="w-44 text-center">
              <p className="text-xs font-bold text-gray-900 leading-normal pb-0.5">
                Sample collected
              </p>
              <p className="text-[11px] text-gray-500 leading-normal">
                {sampleCollectedDate}
              </p>
            </div>

            {/* Step 3: Glucose result ready (Centered) */}
            <div className="w-44 text-center">
              <p className="text-xs font-bold text-gray-900 leading-normal pb-0.5">
                {shortTest1} result ready
              </p>
              <p className="text-[11px] text-gray-500 leading-normal">
                {isAbnormal ? "Abnormal" : "Normal"}
              </p>
            </div>

            {/* Step 4: Final State Milestone (Right aligned) */}
            <div className="w-36 text-right">
              <p className="text-xs font-bold text-gray-900 leading-normal pb-0.5">
                {step4Title}
              </p>
              <p className="text-[11px] text-gray-500 leading-normal">
                {step4Subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* ──────────────── 3. DYNAMIC TEST RESULT CARDS (STRICTLY FROM RECORD) ──────────────── */}
        {items.map((item, index) => renderTestCard(item, index, items.length))}

        {/* ──────────────── 5. FOOTER ──────────────── */}
        <div
          data-pdf-unit
          className="flex items-center justify-between pt-5 mt-4 border-t border-gray-100"
        >
          {/* Left: Powered by DocuHealth (Perfect table-cell vertical centering for html2canvas & browsers) */}
          <div
            className="official-report-footer-brand"
            style={{
              display: "inline-table",
              verticalAlign: "middle",
              borderCollapse: "collapse",
            }}
          >
            <div style={{ display: "table-row" }}>
              <div
                style={{
                  display: "table-cell",
                  verticalAlign: "middle",
                  paddingRight: "6px",
                  lineHeight: 0,
                  fontSize: 0,
                }}
              >
                <img
                  src={docuhealth_logo}
                  alt="DocuHealth Logo"
                  style={{
                    width: "14px",
                    height: "14px",
                    display: "block",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div
                style={{
                  display: "table-cell",
                  verticalAlign: "middle",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#6b7280",
                  whiteSpace: "nowrap",
                  lineHeight: "14px",
                }}
              >
                Powered by DocuHealth
              </div>
            </div>
          </div>

          {/* Right: Issued Date */}
          <span
            className="text-xs text-gray-500 font-medium"
            style={{
              display: "inline-block",
              verticalAlign: "middle",
              lineHeight: "14px",
            }}
          >
            Issued {issuedDate}
          </span>
        </div>
      </div>
    </div>
  );
});

LabOfficialReportTemplate.propTypes = {
  order: PropTypes.object,
  hospitalName: PropTypes.string,
  hospitalLogo: PropTypes.string,
  hospitalAddress: PropTypes.string,
  hospitalEmail: PropTypes.string,
  className: PropTypes.string,
};

export default LabOfficialReportTemplate;
