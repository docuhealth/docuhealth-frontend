import axiosInstanceHos from "../../../utils/axiosInstanceHos";

// status: "pending" | "in_progress" | "completed" | "rejected"
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
  let url = "api/lab/lab-tests";
  if (category) url += `?category=${category}`;
  const res = await axiosInstanceHos.get(url);
  return res.data;
};

export const fetchLabOrderDetail = async (sqid) => {
  const res = await axiosInstanceHos.get(`api/lab/test-orders/${sqid}`);
  return res.data;
};

export const acceptLabRequest = async (sqid) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/${sqid}/accept`);
  return res.data;
};

export const rejectLabRequest = async ({ sqid, reason }) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/${sqid}/reject`, { rejection_reason: reason });
  return res.data;
};

export const logSpecimenCollectionTime = async ({ sqid, specimen_collected_at }) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/${sqid}/specimen-collection-time`, { specimen_collected_at });
  return res.data;
};

export const submitTestResult = async (payload) => {
  const res = await axiosInstanceHos.post("api/lab/test-orders/submit-result", payload);
  return res.data;
};
