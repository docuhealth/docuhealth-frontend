// queries/Hospital/admin/profile.js
import axiosInstanceHos from "../../../lib/axios/hospital";

export const fetchNurseProfile = async () => {
  const res = await axiosInstanceHos.get("api/nurses/dashboard");
  return res.data;
};

