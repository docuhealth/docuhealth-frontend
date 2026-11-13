import axiosInstanceHos from "../../../lib/axios/hospital";

// Doctor-only. POST /api/hospital-ops/check-ins/<sqid>/close — ends a visit without admitting.
// 400 `{check_in: ["This check-in is already closed."]}` on a repeat.
export const closeCheckIn = async (checkInSqid) => {
  const res = await axiosInstanceHos.post(`api/hospital-ops/check-ins/${checkInSqid}/close`);
  return res.data;
};

// Doctor-only. POST /api/hospital-ops/check-ins/<sqid>/end-encounter — doctor_active -> doctor_seen. Saving a SOAP
// note no longer ends the consultation, so this is the only way to. The visit stays open (claim again to resume).
export const endEncounter = async (checkInSqid) => {
  const res = await axiosInstanceHos.post(`api/hospital-ops/check-ins/${checkInSqid}/end-encounter`);
  return res.data;
};

// Check-ins with a consultation in progress (`doctor_active`). Orders, vitals and bed requests against a
// check-in are refused outside one, and ending the encounter or checking out closes it, so callers re-check this list.
export const ACTIVE_CHECK_INS_KEY = ["doctor-active-check-ins"];

export const fetchActiveCheckIns = async () => {
  const res = await axiosInstanceHos.get("api/hospital-ops/check-ins/doctor-queue?status=doctor_active&size=100");
  return res.data?.results || [];
};
