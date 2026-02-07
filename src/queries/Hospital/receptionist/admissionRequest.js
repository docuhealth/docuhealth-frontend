import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchAdmissionRequests = async ({ queryKey }) => {
  const [_key, page] = queryKey;
  const pageSize = 7;
  const res = await axiosInstanceHos.get(
    `api/receptionists/admissions/requests?page=${page}&size=${pageSize}`,
  );

  return res.data;
};
