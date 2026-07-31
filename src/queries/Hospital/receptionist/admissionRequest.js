import axiosInstanceHos from "../../../lib/axios/hospital";

export const fetchAdmissionRequests = async ({ queryKey }) => {
  const [_key, page, search] = queryKey;
  const pageSize = 7;
  let url = `api/receptionists/admissions/requests?page=${page}&size=${pageSize}`;
  if (search) url += `&search=${search}`;
  const res = await axiosInstanceHos.get(url);
  return res.data;
};
