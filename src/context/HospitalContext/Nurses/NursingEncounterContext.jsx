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

  const fetchEncounters = async () => {
    setLoading(true);
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

  const startEncounter = async (sqid) => {
    try {
      const localInProgress = JSON.parse(localStorage.getItem("reservedEncounters") || "[]");
      const encounter = encounters.find((enc) => enc.sqid === sqid);

      // If already reserved by this nurse, just return true to open the modal without hitting the API again
      if (localInProgress.includes(sqid) && encounter?.status === "nursing_active") {
        return true;
      }

      await axiosInstanceHos.post(`/api/nurses/check-ins/${sqid}/reserve`, {});
      
      // Save to localStorage so we know this nurse reserved it
      const updatedLocalInProgress = JSON.parse(localStorage.getItem("reservedEncounters") || "[]");
      if (!updatedLocalInProgress.includes(sqid)) {
        updatedLocalInProgress.push(sqid);
        localStorage.setItem("reservedEncounters", JSON.stringify(updatedLocalInProgress));
      }

      // Update local state immediately
      setEncounters((prev) =>
        prev.map((enc) => (enc.sqid === sqid ? { ...enc, status: "nursing_active" } : enc))
      );
      
      return true;
    } catch (error) {
      toast.error(error.response?.data?.check_in?.[0] || error.response?.data?.check_in || "Failed to reserve encounter.");
      return false;
    }
  };

  const submitAssessment = async (sqid, payload, escalate = false) => {
    try {
      const finalPayload = { ...payload, escalate };
      await axiosInstanceHos.post(`/api/nurses/check-ins/${sqid}/nursing-assessment`, finalPayload);
      
      // Remove from localStorage
      const localInProgress = JSON.parse(localStorage.getItem("reservedEncounters") || "[]");
      const updatedLocal = localInProgress.filter((id) => id !== sqid);
      localStorage.setItem("reservedEncounters", JSON.stringify(updatedLocal));

      toast.success(escalate ? "Patient sent to doctor's queue!" : "Encounter recorded successfully!");
      fetchEncounters(); // Invalidate queries/refetch
      return true;
    } catch (error) {
      toast.error(error.response?.data?.check_in?.[0] || error.response?.data?.check_in || "Failed to submit assessment.");
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
        startEncounter,
        submitAssessment
      }}
    >
      {children}
    </NursingEncounterContext.Provider>
  );
};

export default NursingEncounterProvider;
