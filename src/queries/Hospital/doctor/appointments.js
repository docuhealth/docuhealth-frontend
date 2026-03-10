import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchAppointments = async ({ queryKey }) => {
  const [_key, page, type] = queryKey;
  const pageSize = 7;

  const endpoint = type === 'history' ? 'appointments/history' : 'appointments/upcoming';

  const res = await axiosInstanceHos.get(
    `api/doctors/${endpoint}?page=${page}&size=${pageSize}`,
  );

  return res.data;
};
