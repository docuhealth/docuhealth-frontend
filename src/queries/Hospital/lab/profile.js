import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchLabProfile = async () => {
  const res = await axiosInstanceHos.get("api/lab/dashboard");
  return res.data;
};
