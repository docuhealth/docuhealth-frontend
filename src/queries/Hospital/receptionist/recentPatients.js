import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchRecentPatients = async ({ queryKey }) => {
  const [_key, page, search] = queryKey;
  const pageSize = 7;
  let url = `api/receptionists/patients/recent?page=${page}&size=${pageSize}`;
  if (search) url += `&search=${search}`;
  const res = await axiosInstanceHos.get(url);
  return res.data;
};