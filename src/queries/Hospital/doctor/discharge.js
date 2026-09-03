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
