import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../services/authService";
import { fetchStaff } from "../../queries/Hospital/fetchStaff";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const HosStaffsContext = createContext();

const HosStaffsProvider = (props) => {

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 7; // Example page size

    const isUserLoggedIn = !!getHospitalToken();

      const {
    data, 
    isPending,
    isFetching,
    isError,
    error
  } = useQuery ({
    queryKey : ["hospital-staffs", currentPage],
    queryFn : fetchStaff,
    enabled : isUserLoggedIn,
    placeholderData : keepPreviousData,
  })

    useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || "Error fetching staffs");
      console.error(error);
    }
  }, [isError, error]);

   const staffs = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize)

  const value ={
    staffs,
    count,
    currentPage,
    setCurrentPage,
    totalPages,
    loading: isPending,
    isRefreshing : isFetching
  }


    return (
        <HosStaffsContext.Provider
            value={value}
        >
            {props.children}
        </HosStaffsContext.Provider>
    )
}

export default HosStaffsProvider