import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { Check, Image as ImageIcon, FileText } from "lucide-react";
import docuhealth_logo from "../../../../assets/img/docuhealth_logo.png";

// Helper to mask HIN: 6503••••••62
const maskHin = (hin) => {
  const s = String(hin ?? "").trim();
  if (!s || s === "—") return "—";
  return s.length > 6 ? `${s.slice(0, 4)}${"•".repeat(Math.max(4, s.length - 6))}${s.slice(-2)}` : s;
};

// Calculate age string from DOB or fallback
const calcAge = (dob, fallbackAge) => {
  if (fallbackAge) return `${fallbackAge} yrs`;
  if (!dob) return "—";
  const years = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  return isNaN(years) || years <= 0 ? "—" : `${years} yrs`;
};

// Helper to format date & time cleanly
const formatDateTime = (raw) => {
  if (!raw) return "—";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return String(raw);
    return d.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(raw);
  }
};

// Helper to render text or array of lines safely
const renderContent = (val) => {
  if (!val) return null;
  if (Array.isArray(val)) {
    const cleanLines = val.filter((l) => Boolean(l && String(l).trim()));
    if (cleanLines.length === 0) return null;
    if (cleanLines.length === 1) return cleanLines[0];
    return (
      <ol className="list-decimal pl-4 space-y-1">
        {cleanLines.map((line, idx) => (
          <li key={idx} className="leading-relaxed">
            {line}
          </li>
        ))}
      </ol>
    );
  }
  return <span className="whitespace-pre-line leading-relaxed">{String(val).trim()}</span>;
};

const RadiologyOfficialReportTemplate = forwardRef(function RadiologyOfficialReportTemplate(
  {
    order = {},
    report: propReport = null,
    attachments: propAttachments = null,
    hospitalName = "",
    hospitalLogo = null,
    hospitalAddress = "",
    hospitalEmail = "",
    className = "",
  },
  ref
) {
  // ── Hospital Info ──
  const displayHospitalName =
    order.hospital ||
    order.hospital_info?.name ||
    hospitalName ||
    "DocuHealth Partner Hospital";

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

  const hospitalSubtitle = cleanAddress
    ? `${cleanAddress} · ${displayHospitalEmail}`
    : displayHospitalEmail;

  const displayHospitalLogo =
    order.hospital_info?.profile_image ||
    order.hospital_info?.logo ||
    order.hospital_logo ||
    hospitalLogo;

  // ── Patient Info ──
  const patient = order.patient_info || {};
  const patientName =
    order.name ||
    [patient.firstname, patient.lastname].filter(Boolean).join(" ") ||
    "Patient Record";
  const maskedHin = maskHin(order.hin || patient.hin);
  const ageStr = calcAge(order.dob || patient.dob, order.age || patient.age);
  const rawGender = String(order.gender || patient.sex || patient.gender || "").trim();
  const capitalizedGender = rawGender
    ? rawGender.charAt(0).toUpperCase() + rawGender.slice(1).toLowerCase()
    : "";
  const ageGender = ageStr !== "—" && capitalizedGender
    ? `${ageStr} · ${capitalizedGender}`
    : ageStr !== "—"
    ? ageStr
    : capitalizedGender || "—";

  const requestedBy =
    order.requested_by ||
    order.ordered_by?.name ||
    [order.ordered_by?.firstname, order.ordered_by?.lastname].filter(Boolean).join(" ") ||
    "Dr. Heritech Ruach";

  const shortRequestedBy = requestedBy.startsWith("Dr.")
    ? requestedBy
    : `Dr. ${requestedBy}`;

  // ── Dates ──
  const requestedDateFormatted = formatDateTime(order.created_at || order.datetime);
  const imageCollectedDateFormatted = order.image_collected_at
    ? formatDateTime(order.image_collected_at)
    : null;

  // ── Report & Attachments ──
  const report = propReport || order.report || null;
  const attachments = Array.isArray(propAttachments)
    ? propAttachments
    : Array.isArray(order.attachments)
    ? order.attachments
    : [];

  const status = String(order.status || "").toLowerCase().trim();
  const reportStatus = String(report?.status || "").toLowerCase().trim();

  const isImageCollected = Boolean(
    order.image_collected_at ||
    ["image_collected", "completed", "approved"].includes(status)
  );

  const isApproved = Boolean(
    status === "completed" ||
    reportStatus === "approved" ||
    order.aggregate_status === "completed" ||
    order.aggregate_status === "approved" ||
    order.aggregate_status === "result_ready"
  );

  const reportedAtFormatted = formatDateTime(
    report?.reported_at || report?.created_at || order.created_at
  );

  // ── Scan Details ──
  const scanTitle =
    order.scan_type ||
    order.examinations ||
    order.name ||
    order.test_info?.name ||
    "Radiology Imaging Scan";

  // ── Findings strictly from record without dummy fallback ──
  const clinicalIndication =
    report?.clinical_indication ||
    report?.clinicalIndication ||
    order.clinical_indication ||
    null;

  const findings = report?.findings || null;
  const impression = report?.impression || null;
  const recommendations =
    report?.recommendations || report?.recommendation || null;

  const hasClinicalIndication = Boolean(clinicalIndication && String(clinicalIndication).trim() !== "");
  const hasFindings = Boolean(findings && (Array.isArray(findings) ? findings.length > 0 : String(findings).trim() !== ""));
  const hasImpression = Boolean(impression && (Array.isArray(impression) ? impression.length > 0 : String(impression).trim() !== ""));
  const hasRecommendations = Boolean(recommendations && (Array.isArray(recommendations) ? recommendations.length > 0 : String(recommendations).trim() !== ""));

  const availableFindingsCount = [
    hasClinicalIndication,
    hasFindings,
    hasImpression,
    hasRecommendations,
  ].filter(Boolean).length;

  const reporterName =
    report?.reporter ||
    report?.reported_by?.name ||
    [report?.reported_by?.firstname, report?.reported_by?.lastname].filter(Boolean).join(" ") ||
    "QA Radiologist";

  const specialty = report?.specialty || "Radiology";

  const issuedDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      ref={ref}
      className={`radiology-official-report-template bg-white text-slate-900 w-full font-sans select-text ${className}`}
      style={{ boxShadow: "none" }}
    >
      {/* Zero shadow policy & html2canvas typography stability */}
      <style>{`
        .radiology-official-report-template,
        .radiology-official-report-template *,
        .radiology-official-report-template div,
        .radiology-official-report-template span,
        .radiology-official-report-template button {
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          text-shadow: none !important;
          filter: none !important;
        }

        .radiology-official-report-template .official-status-badge {
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

        .radiology-official-report-template .official-test-card {
          break-inside: auto !important;
          page-break-inside: auto !important;
          -webkit-box-decoration-break: clone;
          box-decoration-break: clone;
        }

        .radiology-official-report-template [data-pdf-unit] {
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
        {/* Top Row: Hospital Logo + Details & Radiology Text */}
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

          {/* Right: Radiology Text (No background) */}
          <span className="text-sm font-semibold text-white shrink-0 tracking-wide">
            Radiology
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

          {/* Column 4: Requested By */}
          <div>
            <p className="text-[10px] font-bold text-purple-200 uppercase tracking-wider mb-1 leading-normal">
              REQUESTED BY
            </p>
            <p className="text-sm font-bold text-white leading-normal pb-0.5">
              {shortRequestedBy}
            </p>
          </div>
        </div>
      </div>

      {/* ──────────────── CONTENT BODY (INSET WITH PADDING) ──────────────── */}
      <div className="px-8 pt-5 pb-6 flex flex-col gap-4">
        {/* ──────────────── 2. PROGRESS TRACKER CARD (3 STEPS) ──────────────── */}
        <div
          data-pdf-unit
          className="bg-white border border-gray-200 rounded-2xl p-5"
        >
          {/* Stepper Track with 3 Circles (Full Width) */}
          <div className="flex items-center w-full relative">
            {/* Step 1 Circle (Requested) */}
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10">
              <Check size={12} strokeWidth={3} />
            </div>
            {/* Line 1 -> 2 */}
            <div
              className={`h-0.5 flex-1 z-0 ${
                isImageCollected ? "bg-emerald-600" : "bg-gray-200"
              }`}
            />

            {/* Step 2 Circle (Image Collected) */}
            {isImageCollected ? (
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10">
                <Check size={12} strokeWidth={3} />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white shrink-0 z-10" />
            )}
            {/* Line 2 -> 3 */}
            <div
              className={`h-0.5 flex-1 z-0 ${
                isApproved ? "bg-emerald-600" : "bg-gray-200"
              }`}
            />

            {/* Step 3 Circle (Report Approved) */}
            {isApproved ? (
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10">
                <Check size={12} strokeWidth={3} />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white shrink-0 z-10" />
            )}
          </div>

          {/* 3 Labels placed under the 3 circles */}
          <div className="flex items-start justify-between w-full mt-2.5">
            {/* Step 1: Scan requested (Left aligned) */}
            <div className="w-48 text-left">
              <p className="text-xs font-bold text-gray-900 leading-normal pb-0.5">
                Scan requested
              </p>
              <p className="text-[11px] text-gray-500 leading-normal">
                By {requestedBy}
              </p>
              <p className="text-[11px] text-gray-400 leading-normal">
                {requestedDateFormatted}
              </p>
            </div>

            {/* Step 2: Image collected (Centered) */}
            <div className="w-48 text-center">
              <p className="text-xs font-bold text-gray-900 leading-normal pb-0.5">
                Image collected
              </p>
              <p className="text-[11px] text-gray-500 leading-normal">
                {imageCollectedDateFormatted || "Awaiting collection"}
              </p>
            </div>

            {/* Step 3: Report approved (Right aligned) */}
            <div className="w-48 text-right">
              <p className="text-xs font-bold text-gray-900 leading-normal pb-0.5">
                {isApproved ? "Report approved" : "Awaiting approval"}
              </p>
              <p className="text-[11px] text-gray-500 leading-normal">
                {isApproved ? reportedAtFormatted : "Under evaluation"}
              </p>
            </div>
          </div>
        </div>

        {/* ──────────────── 3. IMAGING ORDER & CLINICAL FINDINGS ──────────────── */}
        <div className="official-test-card bg-white border border-gray-200 rounded-2xl p-6">
          {/* Header Label & Title with Status Badge */}
          <div data-pdf-unit className="official-card-head-unit mb-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-normal">
              IMAGING ORDER
            </p>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-gray-900 tracking-tight leading-normal m-0 p-0">
                {scanTitle}
              </h2>
              <span
                className={`official-status-badge font-bold text-xs leading-normal ${
                  isApproved ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {isApproved ? "Result ready" : "In Progress"}
              </span>
            </div>
          </div>

          {/* Clinical Findings Grid: 100% dynamic, strictly from record */}
          {availableFindingsCount > 0 ? (
            <div
              data-pdf-unit
              className={`official-findings-unit grid gap-6 pt-4 border-t border-gray-100 ${
                availableFindingsCount === 1
                  ? "grid-cols-1"
                  : availableFindingsCount === 2
                  ? "grid-cols-2"
                  : availableFindingsCount === 3
                  ? "grid-cols-3"
                  : "grid-cols-4"
              }`}
            >
              {hasClinicalIndication && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 leading-normal">
                    CLINICAL INDICATION
                  </p>
                  <div className="text-xs font-semibold text-gray-800">
                    {renderContent(clinicalIndication)}
                  </div>
                </div>
              )}

              {hasFindings && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 leading-normal">
                    FINDINGS
                  </p>
                  <div className="text-xs font-semibold text-gray-800">
                    {renderContent(findings)}
                  </div>
                </div>
              )}

              {hasImpression && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 leading-normal">
                    IMPRESSION
                  </p>
                  <div className="text-xs font-semibold text-gray-800">
                    {renderContent(impression)}
                  </div>
                </div>
              )}

              {hasRecommendations && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 leading-normal">
                    RECOMMENDATIONS
                  </p>
                  <div className="text-xs font-semibold text-gray-800">
                    {renderContent(recommendations)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Fallback to available order metadata when report notes are not entered yet */
            <div data-pdf-unit className="official-findings-unit grid grid-cols-3 gap-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-normal">
                  REQUEST STATUS
                </p>
                <p className="text-xs font-semibold text-gray-800 leading-normal">
                  {status === "completed" ? "Completed" : "Imaging in Progress"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-normal">
                  ORDERED BY
                </p>
                <p className="text-xs font-semibold text-gray-800 leading-normal">
                  {requestedBy}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-normal">
                  CLINICAL EVALUATION
                </p>
                <p className="text-xs font-semibold text-emerald-700 leading-normal">
                  Diagnostic Imaging Protocol
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ──────────────── 4. REPORTED BY CARD ──────────────── */}
        <div
          data-pdf-unit
          className="bg-white border border-gray-200 rounded-2xl p-6"
        >
          <h2 className="text-base font-bold text-gray-900 tracking-tight leading-normal mb-4">
            Reported by
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-normal">
                REPORTER
              </p>
              <p className="text-xs font-bold text-gray-900 leading-normal">
                {reporterName}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-normal">
                SPECIALTY
              </p>
              <p className="text-xs font-semibold text-gray-700 leading-normal">
                {specialty}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 leading-normal">
                REPORTED ON
              </p>
              <p className="text-xs font-semibold text-gray-700 leading-normal">
                {reportedAtFormatted}
              </p>
            </div>
          </div>
        </div>

        {/* ──────────────── 5. UPLOADED DOCUMENTS / IMAGES CARD ──────────────── */}
        <div className="official-test-card bg-white border border-gray-200 rounded-2xl p-6">
          <h2 data-pdf-unit className="text-base font-bold text-gray-900 tracking-tight leading-normal mb-3">
            Uploaded documents / images
          </h2>
          {attachments.length > 0 ? (
            <div className="space-y-2.5">
              {attachments.map((file, idx) => {
                const Icon = file.kind === "image" ? ImageIcon : FileText;
                return (
                  <div
                    key={idx}
                    data-pdf-unit
                    className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-docuhealth-primary rounded-lg shrink-0">
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800 leading-normal">
                          {file.name || `Scan_Attachment_${idx + 1}`}
                        </p>
                        <p className="text-[11px] text-gray-400 leading-normal">
                          {formatDateTime(file.date || order.created_at)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      Attached
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p data-pdf-unit className="text-xs font-bold text-gray-700 tracking-wider">
              NIL
            </p>
          )}
        </div>

        {/* ──────────────── 6. FOOTER ──────────────── */}
        <div
          data-pdf-unit
          className="flex items-center justify-between pt-5 mt-4 border-t border-gray-100"
        >
          {/* Left: Powered by DocuHealth */}
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

RadiologyOfficialReportTemplate.propTypes = {
  order: PropTypes.object,
  report: PropTypes.object,
  attachments: PropTypes.array,
  hospitalName: PropTypes.string,
  hospitalLogo: PropTypes.string,
  hospitalAddress: PropTypes.string,
  hospitalEmail: PropTypes.string,
  className: PropTypes.string,
};

export default RadiologyOfficialReportTemplate;
