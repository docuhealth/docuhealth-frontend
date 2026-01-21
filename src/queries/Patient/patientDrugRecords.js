import axiosInstance from "../../utils/axiosInstance";

export const fetchPatientDrugRecords = async ({queryKey}) => {
    
    const[_key, page, pageSize] = queryKey;

    const res = await axiosInstance.get(
        `api/patients/drug-records?page=${page}&size=${pageSize}`
    );
    // console.log("Fetched drug records:", res.data);
    return res.data
}