// queries/Hospital/admin/dashboard_metrics.js
import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchHospitalDashboardMetrics = async () => {
  const res = await axiosInstanceHos.get("api/hospitals/dashboard");
  return res.data;
};

