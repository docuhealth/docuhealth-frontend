import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInpatientDischargeSummary } from "../../../../../queries/Hospital/doctor/discharge";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import VitalSignsCard from "../../../../ui/VitalSignsCard";

const maskHin = (hin) =>
  hin && hin.length >= 6 ? `${hin.slice(0, 4)}••••••${hin.slice(-2)}` : hin || "N/A";

const titleCase = (s) =>
  typeof s === "string" && s.length
    ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ")
    : "";

const CONDITION_MAP = {
  stable: "Stable condition",
  critical: "Critical condition",
  deceased: "Deceased",
};

const ACCOMPANIED_MAP = {
  relative: "Relative/family",
  solo: "Solo",
  escort: "Escort staff",
};

const MOBILITY_MAP = {
  mobile: "Fully mobile",
  assisted: "Assisted Ambulation",
  bedridden: "Bedridden / Immobile",
};

const IV_SITES_MAP = {
  clean_intact_dry: "Clean, Intact & Dry",
  no_signs_phlebitis: "No Signs of Phlebitis / Infiltration",
  mild_redness: "Mild Redness / Monitoring Required",
  dressing_applied: "Dressing Applied & Secured",
};

const WOUND_MAP = {
  na_no_wounds: "N/A - No Wounds / Intact Skin",
  dressing_clean_dry: "Dressing Clean & Dry",
  slight_serous_oozing: "Slight Serous Oozing",
  infected_purulent: "Infected / Purulent Discharge",
};

const formatValue = (map, val) => {
  if (!val) return "—";
  return map[val] || titleCase(val);
};

const Field = ({ label, value, className = "" }) => (
  <div className={className}>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-800 whitespace-pre-line">
      {value === 0 || value ? value : "—"}
    </p>
  </div>
);

const YesNo = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
    <p className="text-xs text-gray-600">{label}</p>
    <span
      className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
        value
          ? "bg-docuhealth-light-green text-docuhealth-green"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {value ? "Yes" : "No"}
    </span>
  </div>
);

const Section = ({ title, right, children }) => (
  <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 mb-6">
    <div className="flex items-center justify-between gap-3 mb-5">
      <h3 className="font-semibold text-docuhealth-primary text-[15px]">{title}</h3>
      {right}
    </div>
    {children}
  </div>
);

const staffLabel = (s) =>
  s ? `${s.role === "doctor" ? "Dr. " : ""}${s.firstname ?? ""} ${s.lastname ?? ""}`.trim() : null;

// Outpatient discharge summary fallback
const OutpatientDischargeSummary = ({ row, fallbackPatient }) => {
  const patient =
    row?.patient_info || fallbackPatient?.patient_info || fallbackPatient?.patient || {};
  const patientName =
    [patient.firstname, patient.lastname].filter(Boolean).join(" ") || "N/A";
  const form = row?.discharge_form;
  const providerInfo =
    patient?.payment_provider?.type ||
    fallbackPatient?.patient_info?.payment_provider?.type ||
    fallbackPatient?.payment_provider?.type ||
    row?.patient_info?.payment_provider?.type ||
    null;

  return (
    <div className="mb-4">
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{patientName}</h3>
            <p className="text-xs text-gray-500 mb-1">HIN: {maskHin(patient.hin)}</p>
            {patient.gender && (
              <p className="text-xs text-gray-500">Gender: {titleCase(patient.gender)}</p>
            )}
            {providerInfo && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-xs text-gray-500">Provider:</span>
                <span className="text-[11px] font-bold uppercase bg-docuhealth-light-green text-docuhealth-green px-2.5 py-0.5 rounded-full tracking-wider">
                  {providerInfo}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Checked out</p>
            <p className="font-medium text-sm text-gray-800">
              {formatFullDateTime(row?.closed_at || row?.created_at) || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Discharged by</p>
            <p className="font-medium text-sm text-gray-800">
              {staffLabel(form?.discharged_by || row?.discharged_by) || "—"}
            </p>
          </div>
        </div>
      </div>

      <Section
        title="Outpatient discharge"
        right={
          form?.created_at && (
            <span className="text-xs text-gray-500 text-right">
              {formatFullDateTime(form.created_at)}
            </span>
          )
        }
      >
        {!form ? (
          <p className="text-sm text-gray-500">
            No discharge form was linked to this checkout.
          </p>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Chief complaint" value={form.chief_complaint} />
              <Field
                label="Condition at checkout"
                value={titleCase(form.condition_at_checkout)}
              />
              <Field label="Diagnosis" value={form.diagnosis} />
              <Field label="Treatment plan" value={form.treatment_plan} />
            </div>
            <Field label="Follow-up instructions" value={form.follow_up_instructions} />
          </div>
        )}
      </Section>
    </div>
  );
};

const NursingDischargeSummaryView = ({
  patient: initialPatient,
  admission,
  patientFullInfo,
  onCancel,
  admissionSqid: explicitAdmissionSqid,
  dischargeRow,
}) => {
  const admissionSqid =
    explicitAdmissionSqid ||
    dischargeRow?.admission_sqid ||
    dischargeRow?.sqid ||
    admission?.admission_sqid ||
    admission?.sqid;

  const targetRow = dischargeRow || admission;
  const isOutpatientRow =
    !!targetRow &&
    ("discharge_form" in targetRow ||
      targetRow?.status === "outpatient_discharge" ||
      (!targetRow?.ward_info && !!targetRow?.closed_at));
  const hasInlineInpatient =
    !!targetRow &&
    ("nurse_discharge_form" in targetRow || "doctor_discharge_form" in targetRow);

  const {
    data: fetchedData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["inpatient-discharge-summary", admissionSqid],
    queryFn: () => fetchInpatientDischargeSummary({ admissionSqid }),
    enabled: !!admissionSqid && !hasInlineInpatient && !isOutpatientRow,
  });

  if (isOutpatientRow) {
    return (
      <OutpatientDischargeSummary
        row={targetRow}
        fallbackPatient={initialPatient || patientFullInfo}
      />
    );
  }

  const data = hasInlineInpatient ? targetRow : fetchedData;

  if (!hasInlineInpatient && isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-sm text-gray-500">
        <div className="flex flex-col items-center gap-2">
          <span className="inline-block w-6 h-6 border-2 border-gray-300 border-t-docuhealth-primary rounded-full animate-spin"></span>
          <p>Loading discharge summary...</p>
        </div>
      </div>
    );
  }

  if (!hasInlineInpatient && isError) {
    return (
      <div className="py-12 text-center text-sm">
        <p className="text-gray-600">Could not load the discharge summary.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 px-6 py-2 rounded-full border border-docuhealth-primary text-docuhealth-primary hover:bg-blue-50 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  const patient =
    data?.patient_info ||
    patientFullInfo?.patient_info ||
    targetRow?.patient_info ||
    initialPatient ||
    {};

  const patientName =
    [patient.firstname, patient.lastname].filter(Boolean).join(" ") || "N/A";

  const dob = patient?.dob || initialPatient?.dob;
  const age = dob ? Math.floor((new Date() - new Date(dob)) / 31557600000) : null;
  const gender = patient?.gender || initialPatient?.gender;

  const primaryDoctor =
    data?.admitted_by
      ? staffLabel(data.admitted_by)
      : targetRow?.staff_info
        ? `Dr. ${targetRow.staff_info.firstname ?? ""} ${targetRow.staff_info.lastname ?? ""}`.trim()
        : null;

  const providerInfo =
    patient?.payment_provider?.type ||
    patientFullInfo?.patient_info?.payment_provider?.type ||
    targetRow?.patient_info?.payment_provider?.type ||
    null;

  const nurse = data?.nurse_discharge_form;

  if (!data || !nurse) {
    return (
      <div className="mb-4">
        {/* Top Patient Info Banner */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{patientName}</h3>
              <p className="text-xs text-gray-500 mb-1">HIN: {maskHin(patient.hin)}</p>
              {age != null && <p className="text-xs text-gray-500 mb-1">Age: {age} years</p>}
              {gender && <p className="text-xs text-gray-500">Gender: {titleCase(gender)}</p>}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Ward / bed</p>
              <p className="font-medium text-sm text-gray-800">
                {data?.ward_info?.name
                  ? `${data.ward_info.name} ward`
                  : targetRow?.ward_info?.name
                    ? `${targetRow.ward_info.name} ward`
                    : "—"}
              </p>
              {(data?.bed_info?.bed_number != null || targetRow?.bed_info?.bed_number != null) && (
                <p className="text-xs text-gray-500">
                  Bed {data?.bed_info?.bed_number ?? targetRow?.bed_info?.bed_number}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Primary doctor</p>
              <p className="font-medium text-sm text-gray-800 mb-1">{primaryDoctor || "—"}</p>
              {providerInfo && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-gray-500">Provider:</span>
                  <span className="text-[11px] font-bold uppercase bg-docuhealth-light-green text-docuhealth-green px-2.5 py-0.5 rounded-full tracking-wider">
                    {providerInfo}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Discharged date</p>
              <p className="font-medium text-sm text-gray-800">
                {formatFullDateTime(data?.discharge_date || targetRow?.discharge_date) || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 text-center">
          <h3 className="font-semibold text-gray-800 mb-1">
            No nursing discharge summary recorded
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            There is no structured nursing discharge summary recorded for this admission.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      {/* Top Patient Info Banner */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{patientName}</h3>
            <p className="text-xs text-gray-500 mb-1">HIN: {maskHin(patient.hin)}</p>
            {age != null && <p className="text-xs text-gray-500 mb-1">Age: {age} years</p>}
            {gender && <p className="text-xs text-gray-500">Gender: {titleCase(gender)}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Ward / bed</p>
            <p className="font-medium text-sm text-gray-800">
              {data.ward_info?.name
                ? `${data.ward_info.name} ward`
                : targetRow?.ward_info?.name
                  ? `${targetRow.ward_info.name} ward`
                  : "—"}
            </p>
            {(data.bed_info?.bed_number != null || targetRow?.bed_info?.bed_number != null) && (
              <p className="text-xs text-gray-500">
                Bed {data.bed_info?.bed_number ?? targetRow?.bed_info?.bed_number}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Admitted / Discharged</p>
            <p className="font-medium text-sm text-gray-800">
              {formatFullDateTime(data.admission_date || targetRow?.admission_date) || "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Discharged: {formatFullDateTime(data.discharge_date || targetRow?.discharge_date) || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Discharged by nurse</p>
            <p className="font-medium text-sm text-gray-800">
              {nurse.discharged_by
                ? `${nurse.discharged_by.firstname ?? ""} ${nurse.discharged_by.lastname ?? ""}`.trim()
                : "—"}
            </p>
            {providerInfo && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-xs text-gray-500">Provider:</span>
                <span className="text-[11px] font-bold uppercase bg-docuhealth-light-green text-docuhealth-green px-2.5 py-0.5 rounded-full tracking-wider">
                  {providerInfo}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Final discharge vitals */}
      {nurse.final_vital_signs && (
        <VitalSignsCard
          title="Final discharge vitals"
          vitalSigns={nurse.final_vital_signs}
          className="bg-gray-50 rounded-xl border border-gray-100 p-5 mb-6"
        />
      )}

      {/* Nurse's discharge summary */}
      <Section
        title="Nurse's discharge summary"
        right={
          nurse.discharged_by && (
            <span className="text-xs text-gray-500 text-right">
              {`${nurse.discharged_by.firstname ?? ""} ${nurse.discharged_by.lastname ?? ""}`.trim()}
              {nurse.created_at ? ` · ${formatFullDateTime(nurse.created_at)}` : ""}
            </span>
          )
        }
      >
        <div className="space-y-6">
          {/* Line and device clearance checklist */}
          <div>
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Line and device clearance checklist
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              <YesNo
                label="Peripheral IV cannula removed"
                value={nurse.peripheral_iv_cannula_removed}
              />
              <YesNo
                label="Surgical dressing clean & intact"
                value={nurse.surgical_dressing_clean}
              />
              <YesNo
                label="Urinary catheter removed / N/A"
                value={nurse.urinary_catheter_removed}
              />
              <YesNo
                label="Surgical drains removed / N/A"
                value={nurse.surgical_drains_removed}
              />
            </div>
          </div>

          {/* Condition and status at discharge */}
          <div className="pt-2 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
              Discharge condition & status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label="Condition at discharge"
                value={formatValue(CONDITION_MAP, nurse.condition_on_discharge)}
              />
              <Field
                label="Accompanied by"
                value={formatValue(ACCOMPANIED_MAP, nurse.accompanied_by)}
              />
              <Field
                label="Valuables handed"
                value={
                  nurse.valuables_handed
                    ? "Yes, all personal items returned"
                    : "N/A - No valuables stored"
                }
              />
              <Field
                label="Mobility status"
                value={formatValue(MOBILITY_MAP, nurse.mobility_status)}
              />
              <Field
                label="IV sites status"
                value={formatValue(IV_SITES_MAP, nurse.iv_sites_status)}
              />
              <Field
                label="Wound status"
                value={formatValue(WOUND_MAP, nurse.wound_status)}
              />
            </div>
          </div>

          {/* Notes & instructions */}
          <div className="pt-2 border-t border-gray-100 space-y-4">
            <Field label="Education given" value={nurse.education_given} />
            <Field
              label="Follow up instructions explained"
              value={nurse.follow_up_instructions}
            />
          </div>

          {/* Education and handover */}
          <div className="pt-2 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Education and handover
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              <YesNo
                label="Reviewed discharge meds & schedule with patient/relative"
                value={nurse.reviewed_discharge_meds}
              />
              <YesNo
                label="Warning signs for readmission explained"
                value={nurse.warning_signs_explained}
              />
              <YesNo
                label="Medication explained"
                value={nurse.medication_explained}
              />
            </div>
          </div>
        </div>
      </Section>

      {isFetching && (
        <p className="text-xs text-gray-400">Refreshing...</p>
      )}
    </div>
  );
};

export default NursingDischargeSummaryView;
