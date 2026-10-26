import React, { createContext, useState, useEffect, useMemo, useRef } from "react";
import axiosInstanceHos from "../../../lib/axios/hospital";
import toast from "react-hot-toast";
import { extractApiErrorMessage } from "../../../utils/apiError";
import { matchesPatientSearch, SEARCH_PAGE_SIZE } from "../../../utils/matchesPatientSearch";
import { fetchNewestFirstPage, CHECK_IN_PAGE_SIZE } from "../../../utils/newestFirstPage";

export const NursingEncounterContext = createContext();

const TAB_STATUS_MAP = {
  "Pending": "pending",
  "Closed": "closed",
  "Doctor’s call-up/consultation": "sent_to_doctor",
};

// Only the call-up history is shown newest first; Pending and Closed keep the backend's order
const NEWEST_FIRST_STATUSES = new Set(["sent_to_doctor"]);

export const NursingEncounterProvider = ({ children }) => {
  const [encounters, setEncounters] = useState([]);
  const [activeTab, setActiveTab] = useState("Pending");
  const [loading, setLoading] = useState(false);
  
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
  // Last total seen per status, so a newest-first page doesn't need an extra request just to learn the count
  const knownTotals = useRef({});
  // Flips once the backend is seen sending the call-up list newest first; the plain page fetch is then correct
  const backendNewestFirst = useRef(false);

  const fetchEncounters = async ({ silent = false } = {}) => {
    const requestId = ++latestRequest.current;
    if (!silent) setLoading(true);
    try {
      const status = TAB_STATUS_MAP[activeTab];

      let data = null;
      if (NEWEST_FIRST_STATUSES.has(status) && !isSearching && !backendNewestFirst.current) {
        data = await fetchNewestFirstPage("api/nurses/check-ins", status, currentPage, knownTotals.current[status]);
        if (data === null) backendNewestFirst.current = true;
      }
      if (data === null) {
        const url = isSearching
          ? `api/nurses/check-ins?status=${status}&page=1&size=${SEARCH_PAGE_SIZE}`
          : `api/nurses/check-ins?status=${status}&page=${currentPage}`;
        data = (await axiosInstanceHos.get(url)).data;
      }
      if (requestId !== latestRequest.current) return;
      if (!isSearching && data?.count != null) knownTotals.current[status] = data.count;

      if (data?.results) {
        setEncounters(data.results);
        setCount(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / CHECK_IN_PAGE_SIZE) || 1);
      } else {
        setEncounters([]);
        setCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching nursing encounters:", error);
      if (!silent && requestId === latestRequest.current) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage, isSearching]);

  const visibleEncounters = useMemo(
    () => (isSearching ? encounters.filter((e) => matchesPatientSearch(e, searchQuery)) : encounters),
    [encounters, isSearching, searchQuery]
  );

  // Background polling to keep queue reservation state in sync across nurses
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") fetchEncounters({ silent: true });
    }, 30 * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage, isSearching]);

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
      toast.error(extractApiErrorMessage(error, "Failed to claim check-in."));
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
      toast.error(extractApiErrorMessage(error, "Failed to submit assessment."));
      return false;
    }
  };

  return (
    <NursingEncounterContext.Provider
      value={{
        encounters: visibleEncounters,
        activeTab,
        setActiveTab: changeTab,
        loading,
        currentPage,
        setCurrentPage,
        totalPages: isSearching ? 1 : totalPages,
        count: isSearching ? visibleEncounters.length : count,
        searchQuery,
        setSearchQuery,
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
