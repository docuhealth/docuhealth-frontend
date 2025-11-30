import React, { useEffect, useState, createContext } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { getHospitalToken } from "../../../services/authService";


export const ReceptionistHealthPersonnelContext = createContext()

const ReceptionistHealthPersonnelProvider = (props) => {
    const [healthPersonnelList, setHealthPersonnelList] = useState([])
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 7; // Example page size

    const isUserLoggedIn = !!getHospitalToken();

    const fetchHealthPersonnel = async(page = 1) => {
        setLoading(true)

        try {
            const res = await axiosInstance.get(
                `api/hospitals/team-members?page=${page}&size=${pageSize}`
            );

            console.log(res.data)
            setHealthPersonnelList(res.data.results || [])
            setCount(res.data.count || 0);
            setCurrentPage(page);
            setTotalPages(Math.ceil(res.data.count / pageSize));
        }  catch (err) {
            console.error("Error fetching health personnel list:", err);
            toast.error("Error fetching health personnel list");
          } finally {
            setLoading(false);
          }
    }

    useEffect(() => {
        if (isUserLoggedIn) {
            fetchHealthPersonnel(1)
        }
        }, [isUserLoggedIn]);

        return (
            <ReceptionistHealthPersonnelContext.Provider value={{healthPersonnelList, setHealthPersonnelList, fetchHealthPersonnel,loading, count, setCount, currentPage, setCurrentPage, totalPages, setTotalPages  }}>
                {props.children}
            </ReceptionistHealthPersonnelContext.Provider>
        )

    }


    export default ReceptionistHealthPersonnelProvider