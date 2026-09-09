import axiosInstanceHos from "../../../lib/axios/hospital";

// status: "pending" | "sample_collected" | "in_progress" | "result_ready" | "rejected"
export const fetchLabRequests = async ({ queryKey }) => {
  const [_key, status, page, search, category, ordering] = queryKey;
  const pageSize = 6;
  let url = `api/lab/test-orders?status=${status}&page=${page}&size=${pageSize}`;
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
  // `api/lab/lab-tests` paginates at 10/page; these results only ever feed a
  // "select a test" dropdown, so pull a full page or categories with >10 tests
  // (Microbiology, Biochemistry, Endocrinology) silently lose entries.
  let url = "api/lab/lab-tests?size=100";
  if (category) url += `&category=${category}`;
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
  const res = await axiosInstanceHos.post(`api/lab/test-orders/${order_sqid}/items/${item_sqid}/result/submit`, payload);
  return res.data;
};

export const approveLabTestResult = async ({ item_sqid }) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/items/${item_sqid}/result/approve`);
  return res.data;
};

// `.../result/reject` now requires a non-empty `rejection_reason` in the body;
// it 400s without one. The lab scientist sees this reason on the bounced item.
export const rejectLabTestResult = async ({ item_sqid, rejection_reason }) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/items/${item_sqid}/result/reject`, { rejection_reason });
  return res.data;
};

export const createLabTestOrder = async (payload) => {
  const res = await axiosInstanceHos.post("api/lab/test-orders/create", payload);
  return res.data;
};
