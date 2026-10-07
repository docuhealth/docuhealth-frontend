import axiosInstanceHos from "../../../lib/axios/hospital";

// Bed requests for the nurse's own ward, by `status` (pending | accepted | rejected).
// Read-only: only receptionists accept or reject.
export const fetchWardAdmissionRequests = async ({ queryKey }) => {
  const [_key, page, status = "pending"] = queryKey;
  const res = await axiosInstanceHos.get(
    `api/nurses/admissions/requests?page=${page}&size=5&status=${status}`,
  );
  return res.data;
};
