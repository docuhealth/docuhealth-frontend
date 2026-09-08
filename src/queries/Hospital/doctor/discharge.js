import axiosInstanceHos from "../../../lib/axios/hospital";

// Doctor in-patient discharge.
//
// POST /api/inpatients/admissions/<admission_sqid>/doc-discharge-form (JSON).
// Creates the doctor's discharge summary/note AND a `nurse_in_patient_discharge`
// task. The patient is only actually discharged — bed freed, admission marked
// `discharged` — once a nurse executes that task
// (`POST /api/inpatients/task-occurrences/<sqid>/execute`).
//
// Required fields (verified live 2026-09-08 via an empty-body probe):
//   patient                            - patient HIN
//   chief_complaint                    - string
//   primary_diagnosis                  - string
//   secondary_diagnosis                - string
//   comorbidities                      - string
//   treatment_plan                     - string
//   hospital_course_note               - string
//   care_instructions                  - string
//   condition_at_discharge             - string (free text; UI sends a lowercased
//                                        label: improved / stable / unchanged /
//                                        deteriorated / deceased)
//   continue_followup_at_curr_hospital - boolean, no default. (Replaces the old
//                                        `will_continue_followup`, which is no
//                                        longer accepted — sending it alone gives
//                                        400 "continue_followup_at_curr_hospital
//                                        is required"; sending it alongside the
//                                        new field is silently ignored.)
//
// Follow-up fields — all OPTIONAL now, but bound by cross-field rules
// (DOCTOR-INPATIENT-DISCHARGE-FOLLOW-UP.md, every rule re-verified live
// 2026-09-08):
//   follow_up_clinic        - string | null. External clinic name. MUST be null
//                             (or omitted) when continue_followup_at_curr_hospital
//                             is true — the server then fills it with this
//                             hospital's own name. A non-null value with
//                             curr_hospital=true -> 400. An empty string "" ->
//                             400 "may not be blank" (allow_null, not allow_blank)
//                             — so send null, never "".
//   follow_up_date          - "YYYY-MM-DD" | null
//   follow_up_time          - "HH:MM" | "HH:MM:SS" | null
//   follow_up_instructions  - string | null (never "" — 400 "may not be blank")
//
//   Rule A: if there IS a follow-up (curr_hospital true, OR follow_up_clinic
//           non-null) then follow_up_date AND follow_up_time are both required.
//   Rule B: if there is NO follow-up (curr_hospital false AND no follow_up_clinic)
//           then follow_up_date / follow_up_time / follow_up_instructions must not
//           carry a value -> 400 { follow_up: [...] } otherwise. Explicit nulls
//           are fine.
//   Rule C (backend bug, staging 2026-09-08): the no-follow-up path 500s with
//           KeyError 'follow_up_clinic' (hospital_ops/services.py:417,
//           `bool(curr_hospital or discharge_form_data['follow_up_clinic'])`)
//           UNLESS `follow_up_clinic: null` is present in the body. So the UI
//           always sends follow_up_clinic: null on a no-follow-up discharge.
//           Remove this workaround once the backend uses .get().
//
// Optional arrays:
//   completed_investigations / pending_investigations
//                           - [{ sqid: <lab test order item sqid>, type: "lab_test_order" }]
//   discharge_medications   - [{ name, route, quantity, frequency:{value,rate},
//                               duration:{value,rate}, allergies:[], unit }]
//
// Errors: 400 field-required; 400 { admission: ["This is not an active
// admission"] } for a non-active admission; 400 { doctor: ["Doctor has already
// discharged this patient"] } on a repeat discharge.
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
//   } | null
//     The four follow_up_* fields are each nullable (all null when the discharge
//     had no follow-up; follow_up_clinic holds this hospital's own name when the
//     patient follows up here). No will_continue_followup / investigations /
//     discharge_medications on the read model — despite the handoff note, no
//     derived will_continue_followup flag is exposed on this endpoint or on
//     GET /api/hospitals/patients?status=inpatient_discharge (verified 2026-09-08).
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
