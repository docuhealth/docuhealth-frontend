import { useState, useEffect, createContext } from "react";
import { getToken } from "../../services/authService";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { fetchSubaccounts } from "../../queries/Patient/patientSubAccount";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../hooks/useDebounce";

export const SubAccountContext = createContext();

const SubAccountProvider = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 6;

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getToken();
  const queryClient = useQueryClient();

  const { data, isFetching, isPending, isError, error } = useQuery({
    queryKey: ["subAccounts", currentPage, pageSize, debouncedSearch],
    queryFn: fetchSubaccounts,
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (isError) {
      toast.error("Error fetching subaccounts");
      console.error(error);
    }
  }, [isError, error]);

  const subAccounts = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  return (
    <SubAccountContext.Provider
      value={{
        subAccounts,
        isPending,
        isFetching,
        isError,
        error,
        count,
        currentPage,
        totalPages,
        setCurrentPage,
        searchQuery,
        setSearchQuery,
      }}
    >
      {props.children}
    </SubAccountContext.Provider>
  );
};

export default SubAccountProvider;