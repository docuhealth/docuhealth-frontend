import axiosInstance from "../../utils/axiosInstance";

export const fetchPatientDrugRecords = async ({ queryKey }) => {
  const [_key, page, pageSize, search] = queryKey;
  let url = `api/patients/drug-records?page=${page}&size=${pageSize}`;
  if (search) url += `&search=${search}`;
  const res = await axiosInstance.get(url);
  return res.data;
};