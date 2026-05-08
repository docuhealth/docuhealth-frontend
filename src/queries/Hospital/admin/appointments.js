// appointment.js

import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchAppointments = async ({ queryKey }) => {
  const [_key, page, search, dateFrom, dateTo] = queryKey;
  const pageSize = 7;

  const params = new URLSearchParams({ page, size: pageSize });
  if (search) params.append("search", search);
  if (dateFrom) params.append("scheduled_time_gte", dateFrom);
  if (dateTo) params.append("scheduled_time_lte", dateTo);

  const res = await axiosInstanceHos.get(
    `api/hospitals/appointments?${params.toString()}`,
  );

  return res.data;
};
