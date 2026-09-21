// queries/admin/dashboard.js
import axiosInstanceAdmin from "../../lib/axios/admin";

export const fetchAdminDashboardData = async ({ queryKey }) => {
  const [_key, range] = queryKey;
  
  const params = {};
  if (range?.start_date) params.start_date = range.start_date;
  if (range?.end_date) params.end_date = range.end_date;

  const res = await axiosInstanceAdmin.get("api/admin/dashboard", { params });
  return res.data;
};

// User distribution by state
export const fetchAdminDashboardStates = async ({ queryKey }) => {
  const [_key, range] = queryKey;
  const params = {};
  if (range?.start_date) params.start_date = range.start_date;
  if (range?.end_date) params.end_date = range.end_date;

  const res = await axiosInstanceAdmin.get("api/admin/dashboard/states", { params });
  return res.data;
};

// Patients with/without dependants (sub-accounts)
export const fetchAdminDashboardSubAccounts = async ({ queryKey }) => {
  const [_key, range] = queryKey;
  const params = {};
  if (range?.start_date) params.start_date = range.start_date;
  if (range?.end_date) params.end_date = range.end_date;

  const res = await axiosInstanceAdmin.get("api/admin/dashboard/sub-accounts", { params });
  return res.data;
};

// Active subscriptions trend
export const fetchAdminDashboardSubscriptions = async ({ queryKey }) => {
  const [_key, range, filter] = queryKey;
  const params = {};
  if (range?.start_date) params.start_date = range.start_date;
  if (range?.end_date) params.end_date = range.end_date;
  if (filter) {
    const filterLower = filter.toLowerCase();
    if (filterLower.includes("year")) params.period = "yearly";
    else if (filterLower.includes("day") || filterLower.includes("24")) params.period = "daily";
    else params.period = "monthly";
  }

  const res = await axiosInstanceAdmin.get("api/admin/dashboard/subscriptions", { params });
  return res.data;
};

// Registered users trend
export const fetchAdminDashboardUsers = async ({ queryKey }) => {
  const [_key, range, filter] = queryKey;
  const params = {};
  if (range?.start_date) params.start_date = range.start_date;
  if (range?.end_date) params.end_date = range.end_date;
  if (filter) {
    const filterLower = filter.toLowerCase();
    if (filterLower.includes("year")) params.period = "yearly";
    else if (filterLower.includes("day") || filterLower.includes("24")) params.period = "daily";
    else params.period = "monthly";
  }

  const res = await axiosInstanceAdmin.get("api/admin/dashboard/users", { params });
  return res.data;
};

export const fetchAdminProfile = async () => {
  const res = await axiosInstanceAdmin.get("api/auth/profile"); 
  return res.data;
};
