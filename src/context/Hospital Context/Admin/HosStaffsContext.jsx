import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import axiosInstance from "../../../utils/axiosInstance";
import toast from "react-hot-toast";

export const HosStaffsContext = createContext();

const HosStaffsProvider = (props) => {

    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 7; // Example page size

    const isUserLoggedIn = !!getHospitalToken();

    const fetchStaffs = async (page = 1) => {
        setLoading(true);
        // console.log('hi')
        try {
          const res = await axiosInstance.get(
            `api/hospitals/team-members?page=${page}&size=${pageSize}`
          );
          console.log(res.data);
    
          setStaffs(res.data.results || []);
          setCount(res.data.count || 0);
          setCurrentPage(page);
          setTotalPages(Math.ceil(res.data.count / pageSize));
        } catch (err) {
          console.error("Error fetching staffs:", err);
          toast.error("Error fetching staffs");
        } finally {
          setLoading(false);
        }
      };
    
     
    
        useEffect(() => {
        if (isUserLoggedIn) {
            fetchStaffs(1); // Fetch on mount
        }
        }, [isUserLoggedIn]);


    return (
        <HosStaffsContext.Provider
            value={{ staffs, setStaffs, loading, count, setCount, currentPage, setCurrentPage, totalPages, setTotalPages, fetchStaffs }}
        >
            {props.children}
        </HosStaffsContext.Provider>
    )
}

export default HosStaffsProvider