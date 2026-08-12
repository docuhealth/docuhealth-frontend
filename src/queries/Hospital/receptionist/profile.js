// queries/Hospital/admin/profile.js
import axiosInstanceHos from "../../../lib/axios/hospital";

export const fetchReceptionistProfile = async () => {
  const res = await axiosInstanceHos.get("api/receptionists/dashboard");
  return res.data;
};

