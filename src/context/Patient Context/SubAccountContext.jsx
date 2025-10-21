import { useState, useEffect } from "react";
import { createContext } from "react";
import { getToken } from "../../services/authService";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";


export const SubAccountContext = createContext();

const SubAccountProvider = (props) => {
  const [loading, setLoading] = useState(false);
  const [subAccounts, setSubAccounts] = useState([]);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6; // ✅ 6 per page

  const isUserLoggedIn = !!getToken();

   const fetchSubaccounts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `api/patients/subaccounts?page=${page}&size=${pageSize}`
      );
      console.log(res.data);

      setSubAccounts(res.data.results || []);
      setCount(res.data.count || 0);
      setCurrentPage(page);
      setTotalPages(Math.ceil(res.data.count / pageSize));
    } catch (err) {
      console.error("Error fetching subaccounts:", err);
      toast.error("Error fetching subaccounts");
    }finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUserLoggedIn) {
      fetchSubaccounts(1); // ✅ Fetch on mount
    }
  }, [isUserLoggedIn]);
  
  return(
    <SubAccountContext.Provider value={{subAccounts, setSubAccounts, count, setCount, currentPage, setCurrentPage, totalPages, setTotalPages, fetchSubaccounts, loading}}>{props.children}</SubAccountContext.Provider>
  )
}

export default SubAccountProvider;