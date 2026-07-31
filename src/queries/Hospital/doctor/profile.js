//this is the profile.js file.
import axiosInstanceHos from "../../../lib/axios/hospital";

export const fetchDoctorProfile = async () => {
  const res = await axiosInstanceHos.get("api/doctors/dashboard");
  return res.data;
};

export const fetchDocuHealthHospitals = async () => {
const res = await axiosInstanceHos.get(`api/hospitals/hospitals?page=1&size=100`);
  return res.data.results;
};