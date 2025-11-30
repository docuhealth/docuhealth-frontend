import React, { useEffect, useState, createContext } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { getHospitalToken } from "../../../services/authService";
import toast from "react-hot-toast";

export const HosAdmittedPatientMGTContext = createContext()


const HosAdmittedPatientMGTProvider = (props) => {
    const [admittedPatients, setAdmittedPatients] = useState([])
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [tab, setTab] = useState('active')
    const pageSize = 6; // Example page size

    const isUserLoggedIn = !!getHospitalToken();

    const fetchAdmittedPatients = async (page = 1, status = tab) => {
        // active or discharge
        setLoading(true)

        try {
            const res = await axiosInstance.get(
                `api/hospitals/admissions/${status}?page=${page}&size=${pageSize}`
            );

            setAdmittedPatients(res.data.results || [])
            console.log('admitted' , res.data)
            setCount(res.data.count || 0);
            setCurrentPage(page);
            setTotalPages(Math.ceil(res.data.count / pageSize));
        }  catch (err) {
            console.error("Error fetching admitted patients:", err);
            toast.error("Error fetching admitted patients");
          } finally {
            setLoading(false);
          }
    }

    useEffect(() => {
        if (isUserLoggedIn) {
            fetchAdmittedPatients(1, tab)
        }
        }, [isUserLoggedIn,tab]);

        return (
            <HosAdmittedPatientMGTContext.Provider value ={{admittedPatients, setAdmittedPatients, loading, count, currentPage, totalPages, fetchAdmittedPatients, tab, setTab}}>
                {props.children}
            </HosAdmittedPatientMGTContext.Provider>
        )
}

export default HosAdmittedPatientMGTProvider