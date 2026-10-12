import axiosInstanceHos from "../../../lib/axios/hospital";

// Doctor-only. POST /api/doctors/check-ins/<sqid>/close — ends a visit without admitting.
// 400 `{check_in: ["This check-in is already closed."]}` on a repeat.
export const closeCheckIn = async (checkInSqid) => {
  const res = await axiosInstanceHos.post(`api/doctors/check-ins/${checkInSqid}/close`);
  return res.data;
};

// Check-ins with a consultation in progress (`doctor_active`). Orders, vitals and bed requests against a
// check-in are refused outside one, and saving the SOAP note ends it, so callers re-check this list.
export const ACTIVE_CHECK_INS_KEY = ["doctor-active-check-ins"];

export const fetchActiveCheckIns = async () => {
  const res = await axiosInstanceHos.get("api/doctors/check-ins?status=doctor_active&size=100");
  return res.data?.results || [];
};
