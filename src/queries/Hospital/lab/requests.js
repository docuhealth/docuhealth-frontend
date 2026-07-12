import axiosInstanceHos from "../../../utils/axiosInstanceHos";

// status: "pending" | "sample_collected" | "in_progress" | "result_ready" | "rejected"
export const fetchLabRequests = async ({ queryKey }) => {
  const [_key, status, page, search, category, ordering] = queryKey;
  const pageSize = 6;
  let url = `api/lab/test-orders?item_status=${status}&page=${page}&size=${pageSize}`;
  if (search)   url += `&search=${search}`;
  if (category) url += `&category=${category}`;
  if (ordering) url += `&ordering=${ordering}`;
  const res = await axiosInstanceHos.get(url);
  return res.data;
};

export const fetchTestCategories = async () => {
  const res = await axiosInstanceHos.get("api/lab/test-categories");
  return res.data;
};

export const fetchLabTests = async ({ queryKey }) => {
  const [_key, category] = queryKey;
  let url = "api/lab/lab-tests";
  if (category) url += `?category=${category}`;
  const res = await axiosInstanceHos.get(url);
  return res.data;
};

export const fetchLabOrderDetail = async (sqid) => {
  const res = await axiosInstanceHos.get(`api/lab/test-orders/${sqid}`);
  return res.data;
};

export const acceptLabRequest = async ({ order_sqid, item_sqid }) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/${order_sqid}/items/${item_sqid}/accept`);
  return res.data;
};

export const rejectLabRequest = async ({ order_sqid, item_sqid, reason }) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/${order_sqid}/items/${item_sqid}/reject`, { rejection_reason: reason });
  return res.data;
};

export const logSpecimenCollectionTime = async ({ order_sqid, item_sqid, specimen_collected_at }) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/${order_sqid}/items/${item_sqid}/specimen-collection-time`, { specimen_collected_at });
  return res.data;
};

export const submitTestResult = async ({ order_sqid, item_sqid, payload }) => {
  const res = await axiosInstanceHos.post(`api/lab/test-orders/${order_sqid}/items/${item_sqid}/results/submit`, { item: payload });
  return res.data;
};

export const approveLabTestResult = async ({ order_sqid, item_sqid }) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/${order_sqid}/items/${item_sqid}/results/approve`);
  return res.data;
};

export const rejectLabTestResult = async ({ order_sqid, item_sqid }) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/${order_sqid}/items/${item_sqid}/results/reject`);
  return res.data;
};
