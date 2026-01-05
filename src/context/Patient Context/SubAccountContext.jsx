import { useState, useEffect } from "react";
import { createContext } from "react";
import { getToken } from "../../services/authService";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

import { fetchSubaccounts } from "../../queries/Patient/patientSubAccount";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";


export const SubAccountContext = createContext();

const SubAccountProvider = (props) => {

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // ✅ 6 per page

  const isUserLoggedIn = !!getToken();

  const queryClient = useQueryClient()

  const {
    data,
    isFetching,
    isPending,
    isError,
    error
  }= useQuery({
    queryKey : ["subAccounts", currentPage, pageSize],
    queryFn : fetchSubaccounts,
    enabled : isUserLoggedIn,
    placeholderData : keepPreviousData
  })

   // Handle errors via useEffect since onError was removed from useQuery v5
   useEffect(() => {
    if (isError) {
      toast.error("Error fetching subaccounts");
      console.error(error);
    }
  }, [isError, error]);

  const subAccounts = data?.results || []
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);


  
  return(
    <SubAccountContext.Provider value={{
      subAccounts,
      isPending,
      isFetching,
      isError,
      error,
      count,
      currentPage,
      totalPages,
      setCurrentPage
    }}>{props.children}</SubAccountContext.Provider>
  )
}

export default SubAccountProvider;