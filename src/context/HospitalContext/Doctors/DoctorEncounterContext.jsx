import React, { createContext, useState, useEffect } from "react";
import axiosInstanceHos from "../../../lib/axios/hospital";
import toast from "react-hot-toast";

export const DoctorEncounterContext = createContext();

const TAB_STATUS_MAP = {
  "Pending": "doctor_idle",
  "Active": "doctor_active",
};

export const DoctorEncounterProvider = ({ children }) => {
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
      let url = `api/doctors/check-ins?status=${status}&page=${currentPage}`;

      const response = await axiosInstanceHos.get(url);
      const data = response.data;
      
      if (data?.results) {
        setEncounters(data.results);
        setCount(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / 10) || 1);
      } else {
        setEncounters([]);
        setCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching doctor encounters:", error);
      toast.error("Failed to fetch encounters.");
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

  const claimPatient = async (sqid) => {
    try {
      await axiosInstanceHos.post(`api/doctors/check-ins/${sqid}/claim`, {});
      toast.success("Patient successfully claimed!");
      fetchEncounters(); // Refresh list to remove from pending
      return true;
    } catch (error) {
      console.error("Error claiming patient:", error);
      toast.error(error.response?.data?.check_in?.[0] || "Failed to claim patient.");
      return false;
    }
  };

  return (
    <DoctorEncounterContext.Provider
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
        claimPatient
      }}
    >
      {children}
    </DoctorEncounterContext.Provider>
  );
};

export default DoctorEncounterProvider;
