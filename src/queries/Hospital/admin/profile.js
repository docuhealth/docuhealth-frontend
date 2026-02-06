// queries/Hospital/admin/profile.js
import axiosInstanceHos from "../../../utils/axiosInstanceHos";

export const fetchHospitalProfile = async () => {
  const res = await axiosInstanceHos.get("api/hospitals/info");
  return res.data.hospital_profile;
};

