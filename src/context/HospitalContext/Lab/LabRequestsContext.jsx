import React, { useState, useEffect, createContext } from "react";
import PropTypes from "prop-types";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchLabRequests, fetchTestCategories } from "../../../queries/Hospital/lab/requests";

export const LabRequestsContext = createContext();

const TAB_STATUS_MAP = {
  "Pending Test":   "pending",
  "In-progress":    "in_progress",
  "Completed test": "completed",
  "Rejected test":  "rejected",
};

const LabRequestsProvider = (props) => {
  const [activeTab, setActiveTab]           = useState("Pending Test");
  const [currentPage, setCurrentPage]       = useState(1);
  const [searchQuery, setSearchQuery]       = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [ordering, setOrdering] = useState("-created_at");

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedCategory, ordering]);

  const statusFilter = TAB_STATUS_MAP[activeTab];

  const { data, isLoading } = useQuery({
    queryKey: ["lab-requests", statusFilter, currentPage, searchQuery, selectedCategory, ordering],
    queryFn:  fetchLabRequests,
    placeholderData: keepPreviousData,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["lab-test-categories"],
    queryFn:  fetchTestCategories,
    staleTime: Infinity,
  });

  const requests    = data?.results ?? [];
  const count       = data?.count ?? 0;
  const totalPages  = Math.max(1, Math.ceil(count / 6));
  const categories  = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData?.results ?? []);

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
      loading: isLoading,
      searchQuery,
      setSearchQuery,
      categories,
      selectedCategory,
      setSelectedCategory,
      ordering,
      setOrdering,
    }}>
      {props.children}
    </LabRequestsContext.Provider>
  );
};

LabRequestsProvider.propTypes = { children: PropTypes.node };

export default LabRequestsProvider;
