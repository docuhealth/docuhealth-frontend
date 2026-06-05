import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchLabAppointments = async ({ queryKey }) => {
  const [_key, page, search, dateFrom, dateTo] = queryKey;
  const pageSize = 7;
  let url = `api/lab/appointments/upcoming?page=${page}&size=${pageSize}`;
  if (search) url += `&search=${search}`;
  if (dateFrom) url += `&scheduled_time_gte=${dateFrom}`;
  if (dateTo) url += `&scheduled_time_lte=${dateTo}`;
  const res = await axiosInstanceHos.get(url);
  return res.data;
};
