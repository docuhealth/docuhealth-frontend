import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInpatientDischargeSummary } from "../../../../../queries/Hospital/doctor/discharge";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import VitalSignsCard from "../../../../ui/VitalSignsCard";

// Read-only doctor + nurse in-patient discharge summary, off
// GET /api/inpatients/discharged-patients (matched by admission sqid in the query
// layer). The nurse block shows an "awaiting nurse" state until the nurse
// executes the discharge task and `nurse_discharge_form` is populated.

const maskHin = (hin) =>
  hin && hin.length >= 6 ? `${hin.slice(0, 4)}••••••${hin.slice(-2)}` : hin || "N/A";

const titleCase = (s) =>
  typeof s === "string" && s.length
    ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ")
    : "";

const trimSeconds = (t) =>
  typeof t === "string" ? t.replace(/^(\d{2}:\d{2}):\d{2}.*$/, "$1") : t;

const Field = ({ label, value, className = "" }) => (
  <div className={className}>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-800 whitespace-pre-line">
      {value === 0 || value ? value : "—"}
    </p>
  </div>
);

const YesNo = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 py-1.5 border-b border-gray-100 last:border-0">
    <p className="text-xs text-gray-600">{label}</p>
    <span
      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
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
  s ? `Dr. ${s.firstname ?? ""} ${s.lastname ?? ""}`.trim() : null;

const DoctorDischargeSummaryView = ({ admissionSqid, fallbackPatient }) => {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["inpatient-discharge-summary", admissionSqid],
    queryFn: () => fetchInpatientDischargeSummary({ admissionSqid }),
    enabled: !!admissionSqid,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16 text-sm text-gray-500">
        Loading discharge summary...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center text-sm">
        <p className="text-gray-600">Could not load the discharge summary.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 px-6 py-2 rounded-full border border-docuhealth-primary text-docuhealth-primary"
        >
          Try again
        </button>
      </div>
    );
  }

  const patient =
    data?.patient_info || fallbackPatient?.patient_info || fallbackPatient?.patient || {};
  const patientName =
    [patient.firstname, patient.lastname].filter(Boolean).join(" ") || "N/A";

  if (!data) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 text-center">
        <h3 className="font-semibold text-gray-800 mb-1">
          No discharge summary recorded
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          There is no structured discharge summary for this admission. Admissions
          discharged before the in-patient discharge form was introduced do not
          have one.
        </p>
      </div>
    );
  }

  const doc = data.doctor_discharge_form;
  const nurse = data.nurse_discharge_form;

  return (
    <div className="mb-4">
      {/* Patient banner */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{patientName}</h3>
            <p className="text-xs text-gray-500 mb-1">
              HIN: {maskHin(patient.hin)}
            </p>
            {patient.gender && (
              <p className="text-xs text-gray-500">Gender: {titleCase(patient.gender)}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Ward / bed</p>
            <p className="font-medium text-sm text-gray-800">
              {data.ward_info?.name ? `${data.ward_info.name} ward` : "—"}
            </p>
            {data.bed_info?.bed_number != null && (
              <p className="text-xs text-gray-500">Bed {data.bed_info.bed_number}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Admitted</p>
            <p className="font-medium text-sm text-gray-800">
              {formatFullDateTime(data.admission_date) || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Discharged</p>
            <p className="font-medium text-sm text-gray-800">
              {data.discharge_date
                ? formatFullDateTime(data.discharge_date)
                : "Awaiting nurse discharge"}
            </p>
          </div>
        </div>
      </div>

      {/* Doctor's discharge */}
      <Section
        title="Doctor's discharge"
        right={
          doc?.discharged_by && (
            <span className="text-xs text-gray-500 text-right">
              {staffLabel(doc.discharged_by)}
              {doc.created_at ? ` · ${formatFullDateTime(doc.created_at)}` : ""}
            </span>
          )
        }
      >
        {!doc ? (
          <p className="text-sm text-gray-500">No doctor discharge form on this record.</p>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Chief complaint" value={doc.chief_complaint} />
              <Field label="Condition at discharge" value={titleCase(doc.condition_at_discharge)} />
              <Field label="Primary diagnosis" value={doc.primary_diagnosis} />
              <Field label="Secondary diagnosis" value={doc.secondary_diagnosis} />
              <Field label="Comorbidities" value={doc.comorbidities} />
              <Field label="Treatment plan" value={doc.treatment_plan} />
            </div>
            <Field label="Hospital course" value={doc.hospital_course_note} />
            <Field label="Care instructions" value={doc.care_instructions} />

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Follow-up
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Clinic" value={doc.follow_up_clinic} />
                <Field label="Date" value={doc.follow_up_date} />
                <Field label="Time" value={trimSeconds(doc.follow_up_time)} />
              </div>
              <Field
                label="Instructions"
                value={doc.follow_up_instructions}
                className="mt-4"
              />
            </div>
          </div>
        )}
      </Section>

      {/* Nurse's discharge */}
      <Section
        title="Nurse's discharge"
        right={
          nurse?.discharged_by && (
            <span className="text-xs text-gray-500 text-right">
              {`${nurse.discharged_by.firstname ?? ""} ${nurse.discharged_by.lastname ?? ""}`.trim()}
              {nurse.created_at ? ` · ${formatFullDateTime(nurse.created_at)}` : ""}
            </span>
          )
        }
      >
        {!nurse ? (
          <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
            <p className="text-sm font-medium text-amber-700">Awaiting nurse discharge</p>
            <p className="text-xs text-amber-600 mt-0.5">
              A nurse will complete the discharge checklist, record the final vitals
              and free the bed. This section fills in once that is done.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {nurse.final_vital_signs && (
              <VitalSignsCard
                title="Final discharge vitals"
                vitalSigns={nurse.final_vital_signs}
                className="bg-white rounded-xl border border-gray-100 p-4"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              <YesNo label="Peripheral IV cannula removed" value={nurse.peripheral_iv_cannula_removed} />
              <YesNo label="Surgical dressing clean" value={nurse.surgical_dressing_clean} />
              <YesNo label="Urinary catheter removed" value={nurse.urinary_catheter_removed} />
              <YesNo label="Surgical drains removed" value={nurse.surgical_drains_removed} />
              <YesNo label="Valuables handed over" value={nurse.valuables_handed} />
              <YesNo label="Discharge meds reviewed" value={nurse.reviewed_discharge_meds} />
              <YesNo label="Warning signs explained" value={nurse.warning_signs_explained} />
              <YesNo label="Medication explained" value={nurse.medication_explained} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Condition on discharge" value={titleCase(nurse.condition_on_discharge)} />
              <Field label="Accompanied by" value={titleCase(nurse.accompanied_by)} />
              <Field label="Mobility status" value={titleCase(nurse.mobility_status)} />
              <Field label="IV sites status" value={nurse.iv_sites_status} />
              <Field label="Wound status" value={nurse.wound_status} />
            </div>

            <Field label="Education given" value={nurse.education_given} />
            <Field label="Follow-up instructions" value={nurse.follow_up_instructions} />
          </div>
        )}
      </Section>

      {isFetching && (
        <p className="text-xs text-gray-400">Refreshing...</p>
      )}
    </div>
  );
};

export default DoctorDischargeSummaryView;
