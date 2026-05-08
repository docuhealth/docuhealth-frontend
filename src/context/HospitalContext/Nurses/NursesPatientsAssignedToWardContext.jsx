import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import { fetchPatientsInMyWard } from "../../../queries/Hospital/nurse/patientsInWard";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../../hooks/useDebounce";
import toast from "react-hot-toast";

export const NursesPatientsAssignedToWardContext = createContext();

const NursesPatientsAssignedToWardProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 7; // Example page size

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["patients-in-ward", currentPage, debouncedSearch],
    queryFn: fetchPatientsInMyWard,
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
  });

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (isError) {
      toast.error(
        error?.response?.data?.message ||
          "Error fetching patients in my ward !",
      );
      console.error(error);
    }
  }, [isError, error]);

  const assignedPatientsToWard = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  return (
    <NursesPatientsAssignedToWardContext.Provider
      value={{
        assignedPatientsToWard,
        count,
        currentPage,
        setCurrentPage,
        totalPages,
        loading: isPending,
        isRefreshing: isFetching,
        searchQuery,
        setSearchQuery
      }}
    >
      {props.children}
    </NursesPatientsAssignedToWardContext.Provider>
  );
};

export default NursesPatientsAssignedToWardProvider;
