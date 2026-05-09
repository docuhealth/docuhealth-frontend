import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchAppointments = async ({ queryKey }) => {
  const [_key, page, type, search, dateFrom, dateTo] = queryKey;
  const pageSize = 7;

  // map 'history' to 'appointments/history' and 'upcoming' to 'appointments/upcoming'
  const endpoint = type === 'history' ? 'appointments/history' : 'appointments/upcoming';

  const params = new URLSearchParams({
    page: page,
    size: pageSize,
  });

  if (search) params.append("search", search);
  if (dateFrom) params.append("scheduled_time_gte", dateFrom);
  if (dateTo) params.append("scheduled_time_lte", dateTo);

  const res = await axiosInstanceHos.get(
    `api/nurses/${endpoint}?${params.toString()}`,
  );

  return res.data;
};
