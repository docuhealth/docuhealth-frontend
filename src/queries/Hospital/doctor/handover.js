import axiosInstanceHos from "../../../lib/axios/hospital";

// Doctor-to-doctor patient handover (doctor-only).
// GET /api/doctors/handovers?page=&size= — one combined sent+received paginated list.
// No per-patient server filter; callers filter results by `patient_info.hin`.
export const fetchDoctorHandovers = async ({ queryKey }) => {
  const [, page = 1, size = 100] = queryKey;
  const res = await axiosInstanceHos.get(
    `api/doctors/handovers?page=${page}&size=${size}`,
  );
  return res.data;
};

// POST /api/doctors/handover — transfers responsibility for a patient to another doctor.
// Required: to_doctor_id (recipient doctor SQID), patient_hin, working_diagnosis,
// current_clinical_status. The other six clinical fields are optional (sent as "").
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
