import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchLabResults = async ({ queryKey }) => {
  const [_key, page, search] = queryKey;
  const pageSize = 10;
  let url = `api/lab/results?page=${page}&size=${pageSize}`;
  if (search) url += `&search=${search}`;
  const res = await axiosInstanceHos.get(url);
  return res.data;
};

export const fetchLabTests = async ({ queryKey }) => {
  const [_key, page = 1, search = ""] = queryKey;
  let url = `api/lab/lab-tests?page=${page}`;
  if (search) url += `&search=${search}`;
  const res = await axiosInstanceHos.get(url);
  return res.data;
};

// payload: { order: sqid, parameters: [{parameter: sqid, value}], comments?, interpretation?, clinical_correlation? }
export const uploadLabResult = async (payload) => {
  const res = await axiosInstanceHos.post("api/lab/test-orders/submit-result", payload);
  return res.data;
};
