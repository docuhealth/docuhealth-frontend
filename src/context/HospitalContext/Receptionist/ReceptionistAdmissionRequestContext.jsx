import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchAdmissionRequests } from "../../../queries/Hospital/receptionist/admissionRequest";
import useDebounce from "../../../hooks/useDebounce";
import toast from "react-hot-toast";

export const ReceptionistAdmissionRequestContext = createContext();

const ReceptionistAdmissionRequestProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 6;

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["hospital-admission-requests", currentPage, debouncedSearch],
    queryFn: fetchAdmissionRequests,
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (isError) {
      toast.error(
        error?.response?.data?.message ||
          "Error fetching hospital admission requests",
      );
      console.error(error);
    }
  }, [isError, error]);

  const admissionRequests = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  return (
    <ReceptionistAdmissionRequestContext.Provider
      value={{
        admissionRequests,
        loading: isPending,
        isRefreshing: isFetching,
        count,
        currentPage,
        setCurrentPage,
        totalPages,
        searchQuery,
        setSearchQuery,
      }}
    >
      {props.children}
    </ReceptionistAdmissionRequestContext.Provider>
  );
};

export default ReceptionistAdmissionRequestProvider;
