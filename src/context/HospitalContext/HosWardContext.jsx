import React, { createContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHospitalToken } from "../../services/authService";
import { fetchWards, fetchManagedWards } from "../../queries/Hospital/fetchWards";

export const HosWardContext = createContext();

// `manage` is for the hospital admin, who reads wards from wards/manage (staff paths are a 403 for them)
const HosWardProvider = ({ children, manage = false }) => {
  const isUserLoggedIn = !!getHospitalToken();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  
const { 
  data: wardsData, 
  isPending: wardsLoading,
  isPlaceholderData,
  refetch: refetchWards 
} = useQuery({
  queryKey: ["hospital-wards", currentPage, manage ? "manage" : "staff"], // currentPage is at index 1
  queryFn: manage ? fetchManagedWards : fetchWards,
  enabled: isUserLoggedIn,
  placeholderData: (previousData) => previousData,
});

  // Derived values for the UI
  const wards = wardsData?.results || [];
  const count = wardsData?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  const value = {
    wards,
    count,
    currentPage,
    setCurrentPage,
    totalPages,
    wardsLoading,
    isNextPageLoading: isPlaceholderData,
    refetchWards
  };

  return (
    <HosWardContext.Provider value={value}>
      {children}
    </HosWardContext.Provider>
  );
};

export default HosWardProvider;