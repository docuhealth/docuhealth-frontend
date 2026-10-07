import axiosInstanceHos from "../../../lib/axios/hospital";

// Pending bed requests for the nurse's own ward. Read-only: only receptionists accept or reject.
export const fetchWardAdmissionRequests = async ({ queryKey }) => {
  const [_key, page] = queryKey;
  const res = await axiosInstanceHos.get(`api/nurses/admissions/requests?page=${page}&size=5`);
  return res.data;
};
