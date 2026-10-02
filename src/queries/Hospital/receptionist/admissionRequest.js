import axiosInstanceHos from "../../../lib/axios/hospital";

export const fetchAdmissionRequests = async ({ queryKey }) => {
  const [_key, page, search] = queryKey;
  const pageSize = 7;
  let url = `api/receptionists/admissions/requests?page=${page}&size=${pageSize}`;
  if (search) url += `&search=${search}`;
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
