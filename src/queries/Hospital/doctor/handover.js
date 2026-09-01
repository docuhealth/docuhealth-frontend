import axiosInstanceHos from "../../../lib/axios/hospital";

// Doctor-to-doctor patient handover. Doctor-only.

// GET /api/doctors/handovers?page=&size= — one combined sent+received list,
// paginated { count, next, previous, results }. Item (DoctorHandoverRead):
//   { sqid, from_doctor_info, to_doctor_info, patient_info,
//     working_diagnosis, current_clinical_status, critical_events,
//     outstanding_investigations, pending_procedures, pending_consult_reviews,
//     clinical_concerns, management_plan, created_at }
// where *_info = HospitalStaffBasicInfo { staff_id, firstname, lastname, role,
// specialization } / PatientBasicInfo { hin, firstname, lastname, gender, dob }.
// The 6 optional clinical fields come back as "" or null when not filled in.
// There's no per-patient server filter — callers filter results by
// `patient_info.hin`.
export const fetchDoctorHandovers = async ({ queryKey }) => {
  const [, page = 1, size = 100] = queryKey;
  const res = await axiosInstanceHos.get(
    `api/doctors/handovers?page=${page}&size=${size}`,
  );
  return res.data;
};

// POST /api/doctors/handover — transfers responsibility for a patient to
// another doctor.
//
// Required:
//   to_doctor_id             - recipient doctor SQID (from
//                              `api/receptionists/staff/doctor` /
//                              `api/hospitals/team-members`)
//   patient_hin              - patient HIN
//   working_diagnosis        - string, non-blank
//   current_clinical_status  - string, non-blank
// Optional (accepted as "", null, or omitted):
//   critical_events, outstanding_investigations, pending_procedures,
//   pending_consult_reviews, clinical_concerns, management_plan
//
// Errors: 400 field "This field is required." / "may not be blank."; 400
// { to_doctor_id: ["Cannot handover to yourself."] }; 404 "No
// HospitalStaffProfile matches the given query." (bad to_doctor_id, validated
// first); 404 "No PatientProfile matches the given query." (bad patient_hin).
// Success: 201 { detail: "Handover created successfully." }
export const createDoctorHandover = async ({
  to_doctor_id,
  patient_hin,
  working_diagnosis,
  current_clinical_status,
  critical_events = "",
  outstanding_investigations = "",
  pending_procedures = "",
  pending_consult_reviews = "",
  clinical_concerns = "",
  management_plan = "",
}) => {
  const res = await axiosInstanceHos.post("api/doctors/handover", {
    to_doctor_id,
    patient_hin,
    working_diagnosis,
    current_clinical_status,
    critical_events,
    outstanding_investigations,
    pending_procedures,
    pending_consult_reviews,
    clinical_concerns,
    management_plan,
  });
  return res.data;
};
