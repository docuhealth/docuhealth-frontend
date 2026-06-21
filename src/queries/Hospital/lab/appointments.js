import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchLabAppointments = async ({ queryKey }) => {
  const [_key, page, search, dateFrom, dateTo] = queryKey;
  const pageSize = 7;
  const params = new URLSearchParams({
    page: page,
    size: pageSize,
    timeframe: "upcoming", // Since type is not passed in lab, default to upcoming or update it if possible. Let's look at the original code.
  });

  if (search) params.append("search", search);
  if (dateFrom) params.append("scheduled_time_gte", dateFrom);
  if (dateTo) params.append("scheduled_time_lte", dateTo);

  const res = await axiosInstanceHos.get(
    `api/appointments/staff?${params.toString()}`,
  );
  return res.data;
};
