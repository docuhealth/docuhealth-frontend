import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchHospitalDoctorDashboardMetrics = async ({ queryKey }) => {
  const [_key, { start_date, end_date } = {}] = queryKey;

  const params = {};
  if (start_date) params.start_date = start_date;
  if (end_date) params.end_date = end_date;

  const res = await axiosInstanceHos.get("api/doctors/dashboard", { params });
//   console.log(res.data)
  return res.data;
};