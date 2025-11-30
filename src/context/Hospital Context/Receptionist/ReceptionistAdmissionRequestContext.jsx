import React, { useEffect, useState, createContext } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { getHospitalToken } from "../../../services/authService";

export const ReceptionistAdmissionRequestContext = createContext()

const ReceptionistAdmissionRequestProvider = (props) => {
    const [admissionRequests, setAdmissionRequests] = useState([])
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 6; // Example page size

    const isUserLoggedIn = !!getHospitalToken();

    const fetchAdmissionRequests = async (page = 1) => {
        setLoading(true)

        try {
            const res = await axiosInstance.get(
                `api/receptionists/admissions/requests?page=${page}&size=${pageSize}`
            );

            setAdmissionRequests(res.data.results || [])
            console.log(res.data.results)
            setCount(res.data.count || 0);
            setCurrentPage(page);
            setTotalPages(Math.ceil(res.data.count / pageSize));
        }  catch (err) {
            console.error("Error fetching admission requests:", err);
            toast.error("Error fetching admission requests");
          } finally {
            setLoading(false);
          }
    }

    useEffect(() => {
        if (isUserLoggedIn) {
            fetchAdmissionRequests(1)
        }
        }, [isUserLoggedIn]);

    return (
        <ReceptionistAdmissionRequestContext.Provider value={{  admissionRequests, setAdmissionRequests, fetchAdmissionRequests,  loading, count, setCount, currentPage, setCurrentPage, totalPages, setTotalPages }}>
            {props.children}
        </ReceptionistAdmissionRequestContext.Provider>
    )
}

export default ReceptionistAdmissionRequestProvider