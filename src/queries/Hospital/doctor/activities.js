import axiosInstanceHos from "../../../lib/axios/hospital";

export const fetchRecentCareActivities = async ({ queryKey }) => {
  const [_key, hin] = queryKey;
  if (!hin) return null;
  const res = await axiosInstanceHos.get(`api/doctors/patient/activities/${hin}`);
  return res.data;
};
