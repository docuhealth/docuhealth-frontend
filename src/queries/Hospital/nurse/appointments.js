import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchAppointments = async ({ queryKey }) => {
  const [_key, page, type] = queryKey;
  const pageSize = 7;

  // map 'history' to 'appointments/history' and 'upcoming' to 'appointments/upcoming'
  const endpoint = type === 'history' ? 'appointments/history' : 'appointments/upcoming';

  const res = await axiosInstanceHos.get(
    `api/nurses/${endpoint}?page=${page}&size=${pageSize}`,
  );

  return res.data;
};
