import React, { useEffect, useState, createContext } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { getHospitalToken } from "../../../services/authService";


export const NursesPatientsAssignedToWardContext = createContext()


const NursesPatientsAssignedToWardProvider = (props) => {
    const [assignedPatientsToWard, setAssignedPatientsToWard] = useState([])
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 7; // Example page size

    const isUserLoggedIn = !!getHospitalToken();


    const fetchAssignedPatientsToWard = async (page = 1) => {
        setLoading(true)

        try {
            const res = await axiosInstance.get(
                `api/nurses/admissions?page=${page}&size=${pageSize}`
            );
            console.log(res.data)

            setAssignedPatientsToWard(res.data.results || [])
            setCount(res.data.count || 0);
            setCurrentPage(page);
            setTotalPages(Math.ceil(res.data.count / pageSize));
        }  catch (err) {
            console.error("Error fetching assigned patients to ward", err);
            toast.error("Error fetching assigned patients to ward");
          } finally {
            setLoading(false);
          }
    }


    useEffect(() => {
        if (isUserLoggedIn) {
            fetchAssignedPatientsToWard(1)
        }
        }, [isUserLoggedIn]);

        return (
            <NursesPatientsAssignedToWardContext.Provider value ={{
                assignedPatientsToWard, setAssignedPatientsToWard, fetchAssignedPatientsToWard, loading, count, setCount, currentPage, setCurrentPage, totalPages, setTotalPages 
            }}>
                {props.children}
            </NursesPatientsAssignedToWardContext.Provider>
        )

}

export default NursesPatientsAssignedToWardProvider