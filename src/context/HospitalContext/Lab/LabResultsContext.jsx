import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import { fetchLabResults } from "../../../queries/Hospital/lab/results";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../../hooks/useDebounce";
import toast from "react-hot-toast";

export const LabResultsContext = createContext();

const LabResultsProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 10;

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["lab-results", currentPage, debouncedSearch],
    queryFn: fetchLabResults,
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || "Error fetching lab results");
    }
  }, [isError, error]);

  const results = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <LabResultsContext.Provider value={{
      results,
      count,
      currentPage,
      setCurrentPage,
      totalPages,
      loading: isPending,
      isRefreshing: isFetching,
      searchQuery,
      setSearchQuery,
    }}>
      {props.children}
    </LabResultsContext.Provider>
  );
};

export default LabResultsProvider;
