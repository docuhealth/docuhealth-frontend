import axiosInstance from "../../utils/axiosInstance";


export const fetchPatientAppointments = async({ queryKey }) => {

    const [_key, page, pageSize] = queryKey;
    
    const res = await axiosInstance.get(
        `api/patients/appointments?page=${page}&size=${pageSize}`
      );
    return res.data
}