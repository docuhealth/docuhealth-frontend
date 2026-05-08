import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchPatientsInMyWard = async ({ queryKey }) => {
  const [_key, page, search] = queryKey;
  const pageSize = 7;
  
  let url = `api/nurses/admissions?page=${page}&size=${pageSize}`;
  if (search) {
    url += `&search=${search}`;
  }

  const res = await axiosInstanceHos.get(url);

  return res.data;
};