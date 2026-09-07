import React, { createContext, useState, useEffect } from "react";
import axiosInstanceHos from "../../../lib/axios/hospital";
import toast from "react-hot-toast";

export const NursingEncounterContext = createContext();

const TAB_STATUS_MAP = {
  "Pending": "pending",
  "Closed": "closed",
  "Doctor’s call-up/consultation": "sent_to_doctor",
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

  const fetchEncounters = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const status = TAB_STATUS_MAP[activeTab];
      
      let url = `api/nurses/check-ins?status=${status}&page=${currentPage}`;

      const response = await axiosInstanceHos.get(url);
      const data = response.data;
      
      if (data?.results) {
        setEncounters(data.results);
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
      if (!silent) {
        toast.error("Failed to fetch nursing encounters.");
        setEncounters([]);
        setCount(0);
        setTotalPages(1);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEncounters();
  }, [activeTab, currentPage]);

  // Background polling to keep queue reservation state in sync across nurses
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") fetchEncounters({ silent: true });
    }, 30 * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage]);

  const claimEncounter = async (sqid) => {
    try {
      const response = await axiosInstanceHos.post(`/api/nurses/check-ins/${sqid}/reserve`, {});
      toast.success("Check-in claimed successfully!");

      // 1. Update state immediately with response data
      if (response.data && response.data.sqid) {
        setEncounters((prev) =>
          prev.map((enc) => (enc.sqid === sqid ? { ...enc, ...response.data } : enc))
        );
      }

      // 2. Refetch queue immediately so button and reserved_by update in real-time
      await fetchEncounters({ silent: true });
      
      return true;
    } catch (error) {
      console.error("Error reserving encounter:", error);
      toast.error(error.response?.data?.check_in?.[0] || error.response?.data?.check_in || error.response?.data?.message || "Failed to claim check-in.");
      return false;
    }
  };

  const startEncounter = claimEncounter;

  const submitAssessment = async (sqid, payload, escalate = false) => {
    try {
      const finalPayload = { ...payload, escalate };
      await axiosInstanceHos.post(`/api/nurses/check-ins/${sqid}/nursing-assessment`, finalPayload);

      toast.success(escalate ? "Patient sent to doctor's queue!" : "Encounter recorded successfully!");
      fetchEncounters(); // Invalidate / refetch
      return true;
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error(error.response?.data?.check_in?.[0] || error.response?.data?.check_in || error.response?.data?.message || "Failed to submit assessment.");
      return false;
    }
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
        claimEncounter,
        startEncounter,
        submitAssessment
      }}
    >
      {children}
    </NursingEncounterContext.Provider>
  );
};

export default NursingEncounterProvider;
