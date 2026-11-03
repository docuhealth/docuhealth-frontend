import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import { fetchPatientsInMyWard } from "../../../queries/Hospital/nurse/patientsInWard";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../../hooks/useDebounce";
import toast from "react-hot-toast";
import { extractApiErrorMessage } from "../../../utils/apiError";

export const NursesPatientsAssignedToWardContext = createContext();

const NursesPatientsAssignedToWardProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [wardFilter, setWardFilter] = useState("");
  const pageSize = 7; // Example page size

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["patients-in-ward", currentPage, debouncedSearch, wardFilter],
    queryFn: fetchPatientsInMyWard,
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
  });

  // Reset page when search or ward changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, wardFilter]);

  useEffect(() => {
    if (isError) {
      toast.error(extractApiErrorMessage(error, "Error fetching admitted patients!"));
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
        setSearchQuery,
        wardFilter,
        setWardFilter,
      }}
    >
      {props.children}
    </NursesPatientsAssignedToWardContext.Provider>
  );
};

export default NursesPatientsAssignedToWardProvider;
