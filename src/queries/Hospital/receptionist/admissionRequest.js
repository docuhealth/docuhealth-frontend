import axiosInstanceHos from "../../../lib/axios/hospital";

export const ADMISSION_REQUESTS_PAGE_SIZE = 6;

// `status` is pending (the API default), accepted or rejected; anything else is a 400.
export const fetchAdmissionRequests = async ({ queryKey }) => {
  const [_key, page, search, status = "pending"] = queryKey;
  let url = `api/receptionists/admissions/requests?page=${page}&size=${ADMISSION_REQUESTS_PAGE_SIZE}&status=${status}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  const res = await axiosInstanceHos.get(url);
  return res.data;
};

// Receptionist-only. Admits the patient, occupies the bed and closes the source check-in.
export const acceptAdmissionRequest = async (sqid) => {
  const res = await axiosInstanceHos.patch(
    `api/receptionists/admissions/requests/${sqid}/accept`,
  );
  return res.data;
};

// Receptionist-only. A blank `rejection_reason` is a 400; the bed is released.
export const rejectAdmissionRequest = async ({ sqid, rejection_reason }) => {
  const res = await axiosInstanceHos.patch(
    `api/receptionists/admissions/requests/${sqid}/reject`,
    { rejection_reason },
  );
  return res.data;
};
