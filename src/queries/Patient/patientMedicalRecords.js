import axiosInstance from "../../utils/axiosInstance";

export const fetchPatientMedicalRecords = async ({
    queryKey
}) => {

    const [_key, page, pageSize] = queryKey;

    const res = await axiosInstance.get(
        `api/patients/dashboard?page=${page}&size=${pageSize}`
    );

    return res.data
}