import React, { useState, useEffect, createContext } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axiosInstanceHos from "../../../lib/axios/hospital";
import { getHospitalToken } from "../../../services/authService";
import useDebounce from "../../../hooks/useDebounce";

export const ReceptionistAdmittedPatientMGTContext = createContext();

const ReceptionistAdmittedPatientMGTProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 6;

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isLoading: loading, isFetching } = useQuery({
    queryKey: ["hospital-patients-receptionist", tab, currentPage, debouncedSearch],
    queryFn: async () => {
      let url = `api/hospitals/admissions/${tab}?page=${currentPage}&size=${pageSize}`;
      if (debouncedSearch) url += `&search=${debouncedSearch}`;
      const res = await axiosInstanceHos.get(url);
      return res.data;
    },
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const admittedPatients = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setCurrentPage(1);
    setSearchQuery("");
  };

  return (
    <ReceptionistAdmittedPatientMGTContext.Provider
      value={{
        admittedPatients,
        loading,
        isRefreshing: isFetching,
        count,
        currentPage,
        totalPages,
        setCurrentPage,
        tab,
        setTab: handleTabChange,
        searchQuery,
        setSearchQuery,
      }}
    >
      {props.children}
    </ReceptionistAdmittedPatientMGTContext.Provider>
  );
};

export default ReceptionistAdmittedPatientMGTProvider;
