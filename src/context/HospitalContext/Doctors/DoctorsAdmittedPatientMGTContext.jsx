import React, { createContext, useState, useEffect } from "react";
import useDebounce from "../../../hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import axiosInstanceHos from "../../../lib/axios/hospital";
import { getHospitalToken } from "../../../services/authService";

export const DoctorsAdmittedPatientMGTContext = createContext();

const DoctorsAdmittedPatientMGTProvider = ({ children }) => {
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

  const { data, isLoading: loading, isFetching, refetch } = useQuery({
    queryKey: ["hospital-patients-doctor", tab, currentPage, debouncedSearch],
    queryFn: async () => {
      const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
      const res = await axiosInstanceHos.get(
        `api/hospitals/patients?status=${tab}&page=${currentPage}&size=${pageSize}${searchParam}`
      );
      return res.data;
    },
    enabled: isUserLoggedIn,
    placeholderData: (previousData) => previousData,
    // These lists move because the receptionist confirms/rejects admissions
    // and the nurse completes discharges — actions the doctor's own mutation
    // invalidations can't catch. Poll while the tab is open; pause when it's
    // backgrounded so we don't hammer the API.
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setCurrentPage(1); // Reset page on tab switch
  };

  return (
    <DoctorsAdmittedPatientMGTContext.Provider
      value={{
        admittedPatients: data?.results || [],
        loading,
        count: data?.count || 0,
        currentPage,
        totalPages: Math.ceil((data?.count || 0) / pageSize),
        setCurrentPage,
        tab,
        setTab: handleTabChange,
        refetch, 
        searchQuery,
        setSearchQuery,
        isRefreshing: isFetching,
      }}
    >
      {children}
    </DoctorsAdmittedPatientMGTContext.Provider>
  );
};

export default DoctorsAdmittedPatientMGTProvider;