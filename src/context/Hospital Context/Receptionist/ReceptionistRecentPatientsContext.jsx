import React, { useEffect, useState, createContext } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { getHospitalToken } from "../../../services/authService";


export const ReceptionistRecentPatientsContext = createContext()

const ReceptionistRecentPatientsProvider = (props) =>{

    const [recentPatients, setRecentPatients] = useState([])
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 7; // Example page size

    const isUserLoggedIn = !!getHospitalToken();

    const fetchRecentPatients = async(page = 1) => {
        setLoading(true)

        try {
            const res = await axiosInstance.get(
                `api/receptionists/patients/recent?page=${page}&size=${pageSize}`
            );
console.log(res.data)
            setRecentPatients(res.data.results || [])
            setCount(res.data.count || 0);
            setCurrentPage(page);
            setTotalPages(Math.ceil(res.data.count / pageSize));
        }  catch (err) {
            console.error("Error fetching recent patients", err);
            toast.error("Error fetching recent patients");
          } finally {
            setLoading(false);
          }
    }

    useEffect(() => {
        if (isUserLoggedIn) {
            fetchRecentPatients(1)
        }
        }, [isUserLoggedIn]);

    return(
        <ReceptionistRecentPatientsContext.Provider value={{recentPatients, setRecentPatients, fetchRecentPatients, loading, count, setCount, currentPage, setCurrentPage, totalPages, setTotalPages }}>
            {props.children}
        </ReceptionistRecentPatientsContext.Provider>
    )
}

export default ReceptionistRecentPatientsProvider