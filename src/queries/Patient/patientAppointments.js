import axiosInstance from "../../utils/axiosInstance";

export const fetchPatientAppointments = async ({ queryKey }) => {
  const [_key, page, pageSize, search, dateFrom, dateTo] = queryKey;
  let url = `api/patients/appointments?page=${page}&size=${pageSize}`;
  if (search) url += `&search=${search}`;
  if (dateFrom) url += `&scheduled_time_gte=${dateFrom}`;
  if (dateTo) url += `&scheduled_time_lte=${dateTo}`;
  const res = await axiosInstance.get(url);
  return res.data;
};