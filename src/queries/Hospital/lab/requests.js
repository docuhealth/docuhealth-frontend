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
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/${order_sqid}/items/${item_sqid}/result/specimen-collection-time`, { specimen_collected_at });
  return res.data;
};

export const submitTestResult = async ({ order_sqid, item_sqid, payload }) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/${order_sqid}/items/${item_sqid}/result/submit`, payload);
  return res.data;
};

// Lab Admin specific approval
export const approveLabTestResultByLabAdmin = async ({ item_sqid }) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/items/${item_sqid}/result/approve-by-lab-admin`);
  return res.data;
};

// Doctor specific approval
export const approveLabTestResultByDoctor = async ({ item_sqid }) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/items/${item_sqid}/result/approve-by-doctor`);
  return res.data;
};

// Backwards-compatible alias (defaults to lab admin if not specified)
export const approveLabTestResult = async ({ item_sqid, isDoctor = false }) => {
  if (isDoctor) {
    return approveLabTestResultByDoctor({ item_sqid });
  }
  return approveLabTestResultByLabAdmin({ item_sqid });
};

// Lab Admin specific rejection
export const rejectLabTestResultByLabAdmin = async ({ item_sqid, rejection_reason }) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/items/${item_sqid}/result/reject-by-lab-admin`, { rejection_reason });
  return res.data;
};

// Doctor specific rejection
export const rejectLabTestResultByDoctor = async ({ item_sqid, rejection_reason }) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/items/${item_sqid}/result/reject-by-doctor`, { rejection_reason });
  return res.data;
};

// Backwards-compatible alias
export const rejectLabTestResult = async ({ item_sqid, rejection_reason, isDoctor = false }) => {
  if (isDoctor) {
    return rejectLabTestResultByDoctor({ item_sqid, rejection_reason });
  }
  return rejectLabTestResultByLabAdmin({ item_sqid, rejection_reason });
};

export const createLabTestOrder = async (payload) => {
  const res = await axiosInstanceHos.post("api/lab/test-orders/create", payload);
  return res.data;
};

// Audit Logs (Lab Admin only)
export const fetchLabAuditLogs = async ({ page = 1, pageSize = 10 } = {}) => {
  const res = await axiosInstanceHos.get(`api/lab/audit-logs?page=${page}&size=${pageSize}`);
  return res.data;
};

// Add Lab Scientist (Lab Admin only)
export const createLabScientist = async (payload) => {
  const res = await axiosInstanceHos.post("api/lab/lab-scientist", payload);
  return res.data;
};

// Lab Test Details (Create)
export const createLabTestDetails = async (payload) => {
  const res = await axiosInstanceHos.post("api/lab/lab-tests-details/create", payload);
  return res.data;
};

// Lab Test Details (List)
export const fetchLabTestDetails = async ({ page = 1, pageSize = 100 } = {}) => {
  const res = await axiosInstanceHos.get(`api/lab/lab-tests-details?page=${page}&size=${pageSize}`);
  return res.data;
};
