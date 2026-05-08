import React, { useState, createContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstanceHos from "../../../utils/axiosInstanceHos";
import { getHospitalToken } from "../../../services/authService";
import useDebounce from "../../../hooks/useDebounce";

export const NursesAdmittedPatientMGTContext = createContext();

const NursesAdmittedPatientMGTProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState("active"); // 'active' or 'discharged'
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 6;
  const isUserLoggedIn = !!getHospitalToken();

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading: loading, isFetching } = useQuery({
    // 🔹 The Key is the secret: it tracks both status, page, and search
    queryKey: ["hospital-patients-nurse", tab, currentPage, debouncedSearch],
    queryFn: async () => {
      let url = `api/hospitals/admissions/${tab}?page=${currentPage}&size=${pageSize}`;
      if (debouncedSearch) {
        url += `&search=${debouncedSearch}`;
      }
      const res = await axiosInstanceHos.get(url);
      return res.data;
    },
    enabled: isUserLoggedIn,
    placeholderData: (previousData) => previousData, // Smooth transition between pages
  });

  const admittedPatients = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  // 🔹 Helper to switch tabs and reset page
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setCurrentPage(1);
  };

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);


  return (
    <NursesAdmittedPatientMGTContext.Provider
    value={{
        admittedPatients,
      loading,
      isRefreshing: isFetching,
      count,
      currentPage,
      totalPages,
      setCurrentPage, // Pass the setter directly for pagination
      tab,
      setTab: handleTabChange,
      searchQuery,
      setSearchQuery
      }}
    >
      {props.children}
    </NursesAdmittedPatientMGTContext.Provider>
  );
};

export default NursesAdmittedPatientMGTProvider;
