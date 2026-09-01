import axiosInstanceHos from "../../../lib/axios/hospital";

// POST /api/doctors/refer-out — refer an appointment's patient out to another
// DocuHealth hospital. Doctor-only. All three fields required.
//
//   appointment_id  - appointment SQID (the row's `sqid`, NOT the numeric `id`)
//   hospital_to_id  - destination hospital SQID (NOT the `hin` — that 404s)
//   reason          - free text
//
// Error shapes seen live (2026-08-31):
//   404 { detail: "No Appointment matches the given query." }      - bad appt / not yours
//   404 { detail: "No HospitalProfile matches the given query." }  - bad hospital sqid
//   400 { hospital_to_id: ["Cannot refer to the same hospital."] }
// The appointment is validated before the hospital.
export const createReferOut = async ({ appointment_id, hospital_to_id, reason }) => {
  const res = await axiosInstanceHos.post("api/doctors/refer-out", {
    appointment_id,
    hospital_to_id,
    reason,
  });
  return res.data;
};
