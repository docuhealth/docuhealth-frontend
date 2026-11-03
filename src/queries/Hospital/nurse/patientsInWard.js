import axiosInstanceHos from "../../../lib/axios/hospital";

export const fetchPatientsInMyWard = async ({ queryKey }) => {
  const [_key, page, search, ward] = queryKey;
  const pageSize = 7;
  
  let url = `api/hospital-ops/admissions?page=${page}&size=${pageSize}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  // Every ward at the nurse's hospital by default; `ward` (a ward sqid) narrows it to one
  if (ward) {
    url += `&ward=${encodeURIComponent(ward)}`;
  }

  const res = await axiosInstanceHos.get(url);

  return res.data;
};