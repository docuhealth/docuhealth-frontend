import axiosInstanceAdmin from "../../lib/axios/admin";

// Fetch all subscription plans (admin view)
export const fetchAllAdminPlans = async () => {
  const res = await axiosInstanceAdmin.get("api/subscriptions/plans/all");
  return res.data;
};

// Create a new subscription plan
export const createSubscriptionPlan = async (payload) => {
  const res = await axiosInstanceAdmin.post("api/subscriptions/plans", payload);
  return res.data;
};

// Update an existing subscription plan
export const updateSubscriptionPlan = async ({ planSqid, payload }) => {
  const res = await axiosInstanceAdmin.patch(
    `api/subscriptions/plans/${planSqid}`,
    payload
  );
  return res.data;
};

// Fetch subscribed users (paginated, with optional role filter and search)
export const fetchSubscribedUsers = async ({ queryKey }) => {
  const [_key, { role, page, pageSize, search }] = queryKey;
  const params = { page, size: pageSize };
  if (role) params.role = role;
  if (search) params.search = search;
  // This endpoint is not correct, the correct endpoint hasn't been implemented yet
  const res = await axiosInstanceAdmin.get("api/admin/users/patient", { params });
  return res.data;
};
