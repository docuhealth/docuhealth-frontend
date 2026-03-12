// queries/admin/dashboard.js
import axiosInstanceAdmin from "../../utils/axiosInstanceAdmin";

export const fetchAdminDashboardData = async ({ queryKey }) => {
  const [_key, { start_date, end_date }] = queryKey;
  
  const params = {};
  if (start_date) params.start_date = start_date;
  if (end_date) params.end_date = end_date;

  const res = await axiosInstanceAdmin.get("api/admin/dashboard", { params });
  return res.data;
};


export const fetchAdminProfile = async () => {
  const res = await axiosInstanceAdmin.get("api/auth/profile"); 
  return res.data;
};
