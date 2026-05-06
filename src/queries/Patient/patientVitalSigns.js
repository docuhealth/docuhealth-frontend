import axiosInstance from "../../utils/axiosInstance";

export const fetchPatientVitalSigns = async (page = 1) => {
    const res = await axiosInstance.get(`api/patients/vital-signs?page=${page}`);
    // console.log("Vital Signs Result:", res.data);
    return res.data;
};
