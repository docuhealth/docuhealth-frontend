import React, { useEffect, useState, createContext } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { getHospitalToken } from "../../../services/authService";
import toast from 'react-hot-toast'



export const NursesAppointmentsListContext = createContext()


const NursesAppointmentsListProvider = (props) => {
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 7; // Example page size

    const isUserLoggedIn = !!getHospitalToken();

    const fetchAppointmentsList = async (page = 1) => {
        setLoading(true)

        try {
            const res = await axiosInstance.get(
                `api/nurses/appointments?page=${page}&size=${pageSize}`
            );
            console.log(res.data)

            setAppointments(res.data.results || [])
            setCount(res.data.count || 0);
            setCurrentPage(page);
            setTotalPages(Math.ceil(res.data.count / pageSize));
        }  catch (err) {
            console.error("Error fetching appointments", err);
            toast.error("Error fetching appointments");
          } finally {
            setLoading(false);
          }
    }

    
    useEffect(() => {
        if (isUserLoggedIn) {
            fetchAppointmentsList(1)
        }
        }, [isUserLoggedIn]);

        return (
            <NursesAppointmentsListContext.Provider
            value={{appointments, setAppointments, fetchAppointmentsList, loading, count, setCount, currentPage, setCurrentPage, totalPages, setTotalPages }}
            >
                {props.children}
            </NursesAppointmentsListContext.Provider>
        )

}

export default NursesAppointmentsListProvider