//this is the profile.js file.
import axiosInstanceHos from "../../../lib/axios/hospital";

export const fetchDoctorProfile = async () => {
  const res = await axiosInstanceHos.get("api/hospitals/dashboards/doctor");
  return res.data;
};

export const fetchDocuHealthHospitals = async () => {
const res = await axiosInstanceHos.get(`api/hospitals/directory?page=1&size=100`);
  return res.data.results;
};