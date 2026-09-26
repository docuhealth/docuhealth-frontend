import axiosInstanceHos from "../../../lib/axios/hospital";

// A radiologist now receives every appointment assigned to any radiologist at their hospital; `timeframe` is required.
export const fetchRadiologyAppointments = async ({ queryKey }) => {
  const [, timeframe, page = 1, search = "", dateFrom = "", dateTo = ""] = queryKey;
  const params = new URLSearchParams({ page, size: 8, timeframe: timeframe || "today" });

  if (search) params.append("search", search);
  if (dateFrom) params.append("scheduled_time_gte", dateFrom);
  if (dateTo) params.append("scheduled_time_lte", dateTo);

  const res = await axiosInstanceHos.get(`api/appointments/staff?${params.toString()}`);
  return res.data;
};
