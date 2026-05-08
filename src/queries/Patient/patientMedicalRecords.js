import axiosInstance from "../../utils/axiosInstance";

export const fetchPatientMedicalRecords = async ({ queryKey }) => {
  const [_key, page, pageSize, search] = queryKey;
  let url = `api/patients/dashboard?page=${page}&size=${pageSize}`;
  if (search) url += `&search=${search}`;
  const res = await axiosInstance.get(url);
  return res.data;
};