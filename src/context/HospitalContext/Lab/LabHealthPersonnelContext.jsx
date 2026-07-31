import React, { useEffect, useState, createContext } from "react";
import axiosInstanceHos from "../../../lib/axios/hospital";
import { getHospitalToken } from "../../../services/authService";
import toast from "react-hot-toast";

export const LabHealthPersonnelContext = createContext();

const LabHealthPersonnelProvider = (props) => {
  const [healthPersonnelList, setHealthPersonnelList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 7;

  const isUserLoggedIn = !!getHospitalToken();

  const fetchHealthPersonnel = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstanceHos.get(
        `api/hospitals/team-members?page=${page}&size=${pageSize}`
      );
      setHealthPersonnelList(res.data.results || []);
      setCount(res.data.count || 0);
      setCurrentPage(page);
      setTotalPages(Math.ceil((res.data.count || 0) / pageSize));
    } catch (err) {
      toast.error("Error fetching health personnel list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUserLoggedIn) {
      fetchHealthPersonnel(1);
    }
  }, [isUserLoggedIn]);

  return (
    <LabHealthPersonnelContext.Provider value={{
      healthPersonnelList,
      fetchHealthPersonnel,
      loading,
      count,
      currentPage,
      setCurrentPage,
      totalPages,
    }}>
      {props.children}
    </LabHealthPersonnelContext.Provider>
  );
};

export default LabHealthPersonnelProvider;
