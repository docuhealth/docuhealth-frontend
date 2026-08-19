import React, { createContext, useState, useEffect } from "react";
import axiosInstanceHos from "../../../lib/axios/hospital";
import toast from "react-hot-toast";

export const NursingEncounterContext = createContext();

const TAB_STATUS_MAP = {
  "Pending": "pending",
  "Closed": "recorded",
  "Doctor’s call-up/consultation": "escalated",
};

export const NursingEncounterProvider = ({ children }) => {
  const [encounters, setEncounters] = useState([]);
  const [activeTab, setActiveTab] = useState("Pending");
  const [loading, setLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchEncounters = async () => {
    setLoading(true);
    try {
      const status = TAB_STATUS_MAP[activeTab];
      


      let url = `api/nurses/check-ins?status=${status}&page=${currentPage}`;

      const response = await axiosInstanceHos.get(url);
      const data = response.data;
      
      if (data?.results) {
        // Intercept and override status with localStorage state to simulate backend
        const localInProgress = JSON.parse(localStorage.getItem("inProgressEncounters") || "[]");
        
        const mappedResults = data.results.map((enc) => {
          if (localInProgress.includes(enc.sqid)) {
            return { ...enc, status: "in_progress" };
          }
          return enc;
        });

        setEncounters(mappedResults);
        setCount(data.count || 0);
        // Assuming page size is 10
        setTotalPages(Math.ceil((data.count || 0) / 10) || 1);
      } else {
        setEncounters([]);
        setCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching nursing encounters:", error);
      toast.error("Failed to fetch nursing encounters.");
      setEncounters([]);
      setCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEncounters();
  }, [activeTab, currentPage]);

  const startEncounter = (sqid) => {
    // Save to localStorage
    const localInProgress = JSON.parse(localStorage.getItem("inProgressEncounters") || "[]");
    if (!localInProgress.includes(sqid)) {
      localInProgress.push(sqid);
      localStorage.setItem("inProgressEncounters", JSON.stringify(localInProgress));
    }

    // Update local state immediately
    setEncounters((prev) =>
      prev.map((enc) => (enc.sqid === sqid ? { ...enc, status: "in_progress" } : enc))
    );
  };

  return (
    <NursingEncounterContext.Provider
      value={{
        encounters,
        activeTab,
        setActiveTab,
        loading,
        currentPage,
        setCurrentPage,
        totalPages,
        count,
        fetchEncounters,
        startEncounter
      }}
    >
      {children}
    </NursingEncounterContext.Provider>
  );
};

export default NursingEncounterProvider;
