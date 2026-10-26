import React, { createContext, useState, useEffect, useMemo, useRef } from "react";
import axiosInstanceHos from "../../../lib/axios/hospital";
import toast from "react-hot-toast";
import { extractApiErrorMessage } from "../../../utils/apiError";
import { matchesPatientSearch, SEARCH_PAGE_SIZE } from "../../../utils/matchesPatientSearch";

export const DoctorEncounterContext = createContext();

const TAB_STATUS_MAP = {
  "Pending": "doctor_idle",
  "Active": "doctor_active",
};

export const DoctorEncounterProvider = ({ children }) => {
  const [encounters, setEncounters] = useState([]);
  const [activeTab, setActiveTab] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [selectedPatientForWall, setSelectedPatientForWall] = useState(null);
  const [selectedPatientForActivities, setSelectedPatientForActivities] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const isSearching = searchQuery.trim() !== "";

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Clear the search in the same render as the tab change, so the new tab isn't fetched in search mode first
  const changeTab = (tab) => {
    setSearchQuery("");
    setActiveTab(tab);
  };

  // Only the newest request may write the list: a full-tab search fetch and a page fetch can land out of order
  const latestRequest = useRef(0);

  // `silent` skips the loading flag and the error toast — used by the
  // 60s background poll so the list doesn't flash a spinner every minute.
  const fetchEncounters = async ({ silent = false } = {}) => {
    const requestId = ++latestRequest.current;
    if (!silent) setLoading(true);
    try {
      const status = TAB_STATUS_MAP[activeTab];
      let url = isSearching
        ? `api/doctors/check-ins?status=${status}&page=1&size=${SEARCH_PAGE_SIZE}`
        : `api/doctors/check-ins?status=${status}&page=${currentPage}`;

      const response = await axiosInstanceHos.get(url);
      if (requestId !== latestRequest.current) return;
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
      if (!silent && requestId === latestRequest.current) {
        toast.error("Failed to fetch encounters.");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage, isSearching]);

  const visibleEncounters = useMemo(
    () => (isSearching ? encounters.filter((e) => matchesPatientSearch(e, searchQuery)) : encounters),
    [encounters, isSearching, searchQuery]
  );

  // The pending queue fills as nurses finish triage — actions this doctor
  // never triggers, so nothing invalidates it. This list isn't on React
  // Query, so poll it by hand: every 60s while the tab is visible.
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") fetchEncounters({ silent: true });
    }, 60 * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage, isSearching]);

  const claimPatient = async (sqid) => {
    try {
      await axiosInstanceHos.post(`api/doctors/check-ins/${sqid}/claim`, {});
      toast.success("Patient successfully claimed!");
      fetchEncounters(); // Refresh list to remove from pending
      return true;
    } catch (error) {
      console.error("Error claiming patient:", error);
      toast.error(extractApiErrorMessage(error, "Failed to claim patient."));
      return false;
    }
  };

  return (
    <DoctorEncounterContext.Provider
      value={{
        encounters: visibleEncounters,
        activeTab,
        setActiveTab: changeTab,
        setEncounters,
        loading,
        setLoading,
        currentPage,
        setCurrentPage,
        totalPages: isSearching ? 1 : totalPages,
        setTotalPages,
        count: isSearching ? visibleEncounters.length : count,
        setCount,
        searchQuery,
        setSearchQuery,
        fetchEncounters,
        claimPatient,
        selectedPatientForWall,
        setSelectedPatientForWall,
        selectedPatientForActivities,
        setSelectedPatientForActivities,
      }}
    >
      {children}
    </DoctorEncounterContext.Provider>
  );
};

export default DoctorEncounterProvider;
