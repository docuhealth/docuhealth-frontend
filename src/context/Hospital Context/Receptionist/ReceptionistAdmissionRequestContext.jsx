import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchAdmissionRequests } from "../../../queries/Hospital/receptionist/admissionRequest";
import toast from "react-hot-toast";

export const ReceptionistAdmissionRequestContext = createContext();

const ReceptionistAdmissionRequestProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const isUserLoggedIn = !!getHospitalToken();

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["hospital-admission-requests", currentPage],
    queryFn: fetchAdmissionRequests,
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
  });

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
        count,
        currentPage,
        setCurrentPage,
        totalPages,
      }}
    >
      {props.children}
    </ReceptionistAdmissionRequestContext.Provider>
  );
};

export default ReceptionistAdmissionRequestProvider;
