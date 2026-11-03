import axiosInstanceHos from "../../lib/axios/hospital";

// Staff (read only): GET api/hospital-ops/wards. The hospital admin gets a 403 here.
export const fetchWards = async ({ queryKey }) => {
  const [_key, page] = queryKey;
  const pageSize = 20;
  const res = await axiosInstanceHos.get(`api/hospital-ops/wards?page=${page}&size=${pageSize}`);
  return res.data; // Return the whole object to get 'count' and 'results'
};

// Hospital admin (read and write) lives under wards/manage; staff get a 403 there.
export const fetchManagedWards = async ({ queryKey }) => {
  const [_key, page] = queryKey;
  const pageSize = 20;
  const res = await axiosInstanceHos.get(`api/hospital-ops/wards/manage?page=${page}&size=${pageSize}`);
  return res.data;
};

export const createWard = async ({ name, total_beds }) => {
  const res = await axiosInstanceHos.post("api/hospital-ops/wards/manage", { name, total_beds });
  return res.data;
};

export const updateWard = async ({ ward_sqid, name, total_beds }) => {
  const payload = {};
  if (name) payload.name = name;
  if (total_beds !== undefined) payload.total_beds = total_beds;

  const res = await axiosInstanceHos.patch(`api/hospital-ops/wards/manage/${ward_sqid}`, payload);
  return res.data;
};

// A ward with an occupied or requested bed is a 400 with the reason under `ward`
export const deleteWard = async (ward_sqid) => {
  const res = await axiosInstanceHos.delete(`api/hospital-ops/wards/manage/${ward_sqid}`);
  return res.data;
};

// Same path for admin and staff
export const fetchWardBeds = async ({ queryKey }) => {
  const [_key, ward_sqid] = queryKey;
  const res = await axiosInstanceHos.get(`api/hospital-ops/wards/${ward_sqid}/beds`);
  return res.data;
};
