// queries/Hospital/admin/dashboard_metrics.js
import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchHospitalDashboardMetrics = async ({ queryKey }) => {
  const [_key, { start_date, end_date } = {}] = queryKey;

  const params = {};
  if (start_date) params.start_date = start_date;
  if (end_date) params.end_date = end_date;

  const res = await axiosInstanceHos.get("api/hospitals/dashboard", { params });
  return res.data;
};

