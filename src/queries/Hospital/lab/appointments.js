import axiosInstanceHos from "../../../lib/axios/hospital";

export const fetchLabAppointments = async ({ queryKey }) => {
  const [_key, timeframe, page, search, dateFrom, dateTo] = queryKey;
  const pageSize = 7;
  const params = new URLSearchParams({
    page,
    size: pageSize,
    timeframe: timeframe || "upcoming",
  });

  if (search)   params.append("search", search);
  if (dateFrom) params.append("scheduled_time_gte", dateFrom);
  if (dateTo)   params.append("scheduled_time_lte", dateTo);

  const res = await axiosInstanceHos.get(`api/appointments/staff?${params.toString()}`);
  return res.data;
};
