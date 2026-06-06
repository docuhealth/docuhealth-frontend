import React, { useEffect, useState, createContext } from "react";
import { getHospitalToken } from "../../../services/authService";
import { fetchLabRequests, fetchTestCategories } from "../../../queries/Hospital/lab/requests";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useDebounce from "../../../hooks/useDebounce";
import toast from "react-hot-toast";

export const LabRequestsContext = createContext();

const TAB_STATUS_MAP = {
  "Pending Test": "pending",
  "In-progress": "in_progress",
  "Completed test": "completed",
  "Rejected test": "rejected",
};

const LabRequestsProvider = (props) => {
  const [activeTab, setActiveTab] = useState("Pending Test");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const pageSize = 6;

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getHospitalToken();

  const status = TAB_STATUS_MAP[activeTab];

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["lab-test-orders", status, currentPage, debouncedSearch, selectedCategory],
    queryFn: fetchLabRequests,
    enabled: isUserLoggedIn,
    placeholderData: keepPreviousData,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["lab-test-categories"],
    queryFn: fetchTestCategories,
    enabled: isUserLoggedIn,
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearch, selectedCategory]);

  useEffect(() => {
    if (isError) {
      toast.error(error?.response?.data?.message || "Error fetching lab requests");
    }
  }, [isError, error]);

  const requests = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const categories = categoriesData?.results || [];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <LabRequestsContext.Provider value={{
      requests,
      count,
      activeTab,
      setActiveTab: handleTabChange,
      currentPage,
      setCurrentPage,
      totalPages,
      loading: isPending,
      isRefreshing: isFetching,
      searchQuery,
      setSearchQuery,
      categories,
      selectedCategory,
      setSelectedCategory,
    }}>
      {props.children}
    </LabRequestsContext.Provider>
  );
};

export default LabRequestsProvider;
