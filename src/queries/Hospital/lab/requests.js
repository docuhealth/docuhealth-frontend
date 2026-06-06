import axiosInstanceHos from "../../../utils/axiosInstanceHos";

// status: "pending" | "in_progress" | "completed" | "rejected"
export const fetchLabRequests = async ({ queryKey }) => {
  const [_key, status, page, search, category] = queryKey;
  const pageSize = 6;
  let url = `api/lab/test-orders?status=${status}&page=${page}&size=${pageSize}`;
  if (search)   url += `&search=${search}`;
  if (category) url += `&category=${category}`;
  const res = await axiosInstanceHos.get(url);
  return res.data;
};

export const fetchTestCategories = async () => {
  const res = await axiosInstanceHos.get("api/lab/test-categories");
  return res.data;
};

export const acceptLabRequest = async (sqid) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/${sqid}/accept`);
  return res.data;
};

export const rejectLabRequest = async ({ sqid, reason }) => {
  const res = await axiosInstanceHos.patch(`api/lab/test-orders/${sqid}/reject`, { reason });
  return res.data;
};
