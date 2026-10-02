import axiosInstanceHos from "../../../lib/axios/hospital";

// Doctor-only. POST /api/doctors/check-ins/<sqid>/close — ends a visit without admitting.
// 400 `{check_in: ["This check-in is already closed."]}` on a repeat.
export const closeCheckIn = async (checkInSqid) => {
  const res = await axiosInstanceHos.post(`api/doctors/check-ins/${checkInSqid}/close`);
  return res.data;
};
