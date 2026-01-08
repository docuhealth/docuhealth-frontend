import axiosInstance from "../../utils/axiosInstance";


export const fetchStaff = async (role) => {
  const res = await axiosInstance.get(
    `api/receptionists/staff/${role.toLowerCase()}`
  );
  return res.data;
};