import axiosInstanceHos from "../../../lib/axios/hospital";

export const fetchLabProfile = async () => {
  const res = await axiosInstanceHos.get("api/lab/dashboard");
  return res.data;
};
