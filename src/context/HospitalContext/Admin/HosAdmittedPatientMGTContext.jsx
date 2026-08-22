import React, { useState, useEffect, createContext } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstanceHos from "../../../lib/axios/hospital";
import { getHospitalToken } from "../../../services/authService";
import useDebounce from "../../../hooks/useDebounce";

export const HosAdmittedPatientMGTContext = createContext();

const HosAdmittedPatientMGTProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState("inpatient");
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 6;
  const isUserLoggedIn = !!getHospitalToken();
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const { data, isLoading: loading, isFetching } = useQuery({
    queryKey: ["hospital-patients-admin", tab, currentPage, debouncedSearch],
    queryFn: async () => {
      let url = `api/hospitals/patients?status=${tab}&page=${currentPage}&size=${pageSize}`;
      if (debouncedSearch) {
        url += `&search=${debouncedSearch}`;
      }
      const res = await axiosInstanceHos.get(url);
      return res.data;
    },
    enabled: isUserLoggedIn,
    placeholderData: (previousData) => previousData,
  });

  const admittedPatients = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  // Helper to switch tabs and reset page
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setCurrentPage(1); 
  };

  return (
    <HosAdmittedPatientMGTContext.Provider value={{
      admittedPatients,
      loading,
      count,
      currentPage,
      totalPages,
      setCurrentPage,
      tab,
      setTab: handleTabChange,
      searchQuery,
      setSearchQuery,
      isRefreshing: isFetching,
    }}>
      {children}
    </HosAdmittedPatientMGTContext.Provider>
  );
};

export default HosAdmittedPatientMGTProvider;