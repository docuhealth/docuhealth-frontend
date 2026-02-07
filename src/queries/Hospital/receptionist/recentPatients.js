import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchRecentPatients = async ({ queryKey }) => {
  const [_key, page] = queryKey;
  const pageSize = 7;
  const res = await axiosInstanceHos.get(`api/receptionists/patients/recent?page=${page}&size=${pageSize}`);
  return res.data; // Return the whole object to get 'count' and 'results'
};