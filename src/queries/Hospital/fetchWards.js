import axiosInstanceHos from "../../lib/axios/hospital";

export const fetchWards = async ({ queryKey }) => {
  const [_key, page] = queryKey;
  const pageSize = 20;
  const res = await axiosInstanceHos.get(`api/hospitals/wards?page=${page}&size=${pageSize}`);
  return res.data; // Return the whole object to get 'count' and 'results'
};

export const updateWard = async ({ ward_sqid, name, total_beds }) => {
  const payload = {};
  if (name) payload.name = name;
  if (total_beds !== undefined) payload.total_beds = total_beds;
  
  const res = await axiosInstanceHos.patch(`api/hospitals/wards/${ward_sqid}`, payload);
  return res.data;
};

export const fetchWardBeds = async ({ queryKey }) => {
  const [_key, ward_sqid] = queryKey;
  const res = await axiosInstanceHos.get(`api/hospitals/wards/${ward_sqid}/beds`);
  return res.data;
};