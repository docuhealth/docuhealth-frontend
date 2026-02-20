// queries/Hospital/admin/profile.js
import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchReceptionistProfile = async () => {
  const res = await axiosInstanceHos.get("api/receptionists/dashboard");
  return res.data;
};

