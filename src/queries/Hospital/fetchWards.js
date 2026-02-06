import axiosInstanceHos from "../../utils/axiosInstanceHos";

export const fetchWards = async ({ queryKey }) => {
  const [_key, page] = queryKey;
  const pageSize = 20;
  const res = await axiosInstanceHos.get(`api/hospitals/wards?page=${page}&size=${pageSize}`);
  return res.data; // Return the whole object to get 'count' and 'results'
};