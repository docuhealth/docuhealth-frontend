import axiosInstanceHos from "../../../lib/axios/hospital";

// POST /api/doctors/refer-out — refer a patient out to another DocuHealth hospital (doctor-only).
// Send exactly one of check_in (the doctor must be in that consultation) or admission (an active
// stay at the doctor's hospital), plus hospital_to_id (destination hospital SQID) and reason.
export const createReferOut = async ({ check_in, admission, hospital_to_id, reason }) => {
  const res = await axiosInstanceHos.post("api/doctors/refer-out", {
    ...(admission ? { admission } : { check_in }),
    hospital_to_id,
    reason,
  });
  return res.data;
};
