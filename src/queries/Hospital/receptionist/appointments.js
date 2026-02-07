import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchAppointments = async ({ queryKey }) => {
  const [_key, page] = queryKey;
  const pageSize = 7;
  const res = await axiosInstanceHos.get(
    `api/receptionists/appointments/upcoming?page=${page}&size=${pageSize}`,
  );

  return res.data;
};
