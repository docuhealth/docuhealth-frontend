import axiosInstance from "../../utils/axiosInstance";


export const fetchPatientProfile = async () => {
    const res = await axiosInstance.get("api/patients/dashboard"); 
    // console.log(res.data)
    return res.data.patient_info
}

