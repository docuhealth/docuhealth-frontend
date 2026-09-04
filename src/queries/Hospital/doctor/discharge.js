import axiosInstanceHos from "../../../lib/axios/hospital";

// Doctor in-patient discharge.
//
// POST /api/inpatients/admissions/<admission_sqid>/doc-discharge-form (JSON).
// Creates the doctor's discharge summary/note AND a `nurse_in_patient_discharge`
// task. The patient is only actually discharged — bed freed, admission marked
// `discharged` — once a nurse executes that task
// (`POST /api/inpatients/task-occurrences/<sqid>/execute`).
//
// Body (all required except the three arrays):
//   patient                 - patient HIN
//   chief_complaint         - string
//   primary_diagnosis       - string
//   secondary_diagnosis     - string
//   comorbidities           - string
//   treatment_plan          - string
//   hospital_course_note    - string
//   care_instructions       - string
//   condition_at_discharge  - string (free text; UI sends a lowercased label:
//                             improved / stable / unchanged / deteriorated / deceased)
//   will_continue_followup  - boolean
//   follow_up_clinic        - string
//   follow_up_date          - "YYYY-MM-DD"
//   follow_up_time          - "HH:MM" (seconds optional)
//   follow_up_instructions  - string
//   completed_investigations / pending_investigations
//                           - [{ sqid: <lab test order item sqid>, type: "lab_test_order" }]
//   discharge_medications   - [{ name, route, quantity, frequency:{value,rate},
//                               duration:{value,rate}, allergies:[], unit }]
//
// `condition_at_discharge` is a required free-string field on the serializer
// (no enum). Verified live 2026-09-03: it persists and comes back on
// `doctor_discharge_form.condition_at_discharge` from GET
// /api/inpatients/discharged-patients. The UI lowercases its Select label
// before sending.
//
// Errors: 400 field-required; 400 { doctor: ["Doctor has already discharged this
// patient"] } on a repeat discharge.
// Success: 201 { detail: "Doctor Discharge form created for in-patient successfully." }
export const createDoctorInpatientDischarge = async ({ admissionSqid, ...body }) => {
  const res = await axiosInstanceHos.post(
    `api/inpatients/admissions/${admissionSqid}/doc-discharge-form`,
    body,
  );
  return res.data;
};

// Doctor-facing discharge summary lookup.
//
// GET /api/inpatients/discharged-patients?page=&size= is the only source (verified
// live 2026-09-03): there is NO per-admission route, and `?admission_sqid=`,
// `?search=`, `?status=` are all ignored server-side. So page the list and match
// `admission_sqid` client-side. A record appears the moment the doctor discharge
// form is linked to the admission (bed may still be occupied, `nurse_discharge_form`
// null). Older admissions discharged before the `doc-discharge-form` build have no
// record here — callers should treat a `null` return as "no summary recorded".
//
// Result item shape:
//   admission_sqid, admitted_by, patient_info, ward_info, bed_info,
//   admission_date, discharge_date (null until a nurse completes),
//   doctor_discharge_form: {
//     sqid, chief_complaint, primary_diagnosis, secondary_diagnosis, comorbidities,
//     treatment_plan, hospital_course_note, care_instructions, condition_at_discharge,
//     follow_up_clinic, follow_up_date, follow_up_time ("HH:MM:SS"),
//     follow_up_instructions, discharged_by, created_at
//   } | null   (no will_continue_followup / investigations / discharge_medications
//               on the read model)
//   nurse_discharge_form: {
//     sqid, peripheral_iv_cannula_removed, surgical_dressing_clean,
//     urinary_catheter_removed, surgical_drains_removed, condition_on_discharge,
//     accompanied_by (relative|solo|escort), valuables_handed,
//     mobility_status (mobile|assisted|bedridden), iv_sites_status, wound_status,
//     education_given, follow_up_instructions, reviewed_discharge_meds,
//     warning_signs_explained, medication_explained,
//     final_vital_signs { blood_pressure, temp, resp_rate, height, weight,
//       heart_rate, spo2, pain_score, notes, bmi, created_at },
//     discharged_by, created_at
//   } | null
export const fetchInpatientDischargeSummary = async ({ admissionSqid }) => {
  if (!admissionSqid) return null;

  const size = 100;
  let page = 1;

  // Bounded loop: stop when a page has no `next`. `size=100` covers all realistic
  // single-hospital volumes in one request; the loop is just a safety net.
  for (let guard = 0; guard < 50; guard += 1) {
    const { data } = await axiosInstanceHos.get(
      `api/inpatients/discharged-patients?page=${page}&size=${size}`,
    );
    const match = (data?.results || []).find(
      (row) => row.admission_sqid === admissionSqid,
    );
    if (match) return match;
    if (!data?.next) return null;
    page += 1;
  }
  return null;
};
