import axiosInstanceHos from "../../../lib/axios/hospital";

// POST /api/doctors/refer-out — refer an appointment's patient out to another DocuHealth
// hospital (doctor-only). Fields: appointment_id (appointment SQID, not the numeric id),
// hospital_to_id (destination hospital SQID, not the hin), reason. Appointment validated first.
export const createReferOut = async ({ appointment_id, hospital_to_id, reason }) => {
  const res = await axiosInstanceHos.post("api/doctors/refer-out", {
    appointment_id,
    hospital_to_id,
    reason,
  });
  return res.data;
};
