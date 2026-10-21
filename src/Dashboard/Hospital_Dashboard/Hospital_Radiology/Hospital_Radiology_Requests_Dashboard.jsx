import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ScanLine } from "lucide-react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import SearchBar from "../../../Components/SearchBar/SearchBar";
import Select from "../../../Components/ui/Select";
import ScanRequestCard, { ScanRequestCardSkeleton } from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Radiology/Scan_Requests/ScanRequestCard";
import Pagination2 from "../../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";
import { fetchRadiologyScanRequests } from "../../../queries/Hospital/radiology/scan_requests";
import { getHospitalToken } from "../../../services/authService";
import formatRecordDate from "../../../Components/Dashboard/Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";

const SORT_OPTIONS = [
  { value: "-created_at", label: "Sort by: Latest" },
  { value: "created_at", label: "Sort by: Oldest" },
];

const TABS = [
  { title: "Pending order", status: "pending" },
  { title: "In-progress", status: "in_progress" },
  { title: "Completed scan", status: "completed" },
  { title: "Rejected scan", status: "rejected" },
];

const VALID_STATUSES = ["pending", "in_progress", "completed", "rejected"];

// Pending order shows how fresh each request is (New / X days ago — varies
// per card). Every other tab just confirms its own status, same color-coded
// pill on every card in that tab, matching the Lab requests dashboard.
const getBadge = (order, activeStatus) => {
  if (activeStatus === "pending") {
    const label = formatRecordDate(order.created_at) || "New";
    return { label, cls: label === "New" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600" };
  }
  switch (activeStatus) {
    case "in_progress":
      // The tab holds both accepted items and ones whose images are collected and awaiting a result.
      return order.status === "image_collected"
        ? { label: "Image collected", cls: "bg-blue-100 text-blue-600" }
        : { label: "In-progress", cls: "bg-amber-100 text-amber-600" };
    case "completed":
      return { label: "Completed", cls: "bg-green-100 text-green-600" };
    case "rejected":
      return { label: "Rejected", cls: "bg-red-100 text-red-500" };
    default:
      return { label: "—", cls: "bg-gray-100 text-gray-600" };
  }
};

const Hospital_Radiology_Requests_Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialStatus = () => {
    const urlStatus = searchParams.get("status") || searchParams.get("tab");
    if (urlStatus && VALID_STATUSES.includes(urlStatus)) return urlStatus;
    const stateStatus = location.state?.activeStatus || location.state?.fromStatus;
    if (stateStatus && VALID_STATUSES.includes(stateStatus)) return stateStatus;
    const stored = sessionStorage.getItem("radiology_active_status");
    if (stored && VALID_STATUSES.includes(stored)) return stored;
    return "pending";
  };

  const [activeStatus, setActiveStatus] = useState(getInitialStatus);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordering, setOrdering] = useState("-created_at");
  const [searchQuery, setSearchQuery] = useState("");

  const isUserLoggedIn = !!getHospitalToken();

  // Keep state in sync if browser history (back/forward) updates the query param
  useEffect(() => {
    const s = searchParams.get("status") || searchParams.get("tab");
    if (s && VALID_STATUSES.includes(s) && s !== activeStatus) {
      setActiveStatus(s);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["radiology-scan-requests", activeStatus, currentPage, ordering, searchQuery],
    queryFn: fetchRadiologyScanRequests,
    enabled: isUserLoggedIn,
    staleTime: 1000 * 5,
    retry: false,
  });

  const requests = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(count / 6));

  const changeTab = (status) => {
    setActiveStatus(status);
    setCurrentPage(1);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("status", status);
        return next;
      },
      { replace: true }
    );
    sessionStorage.setItem("radiology_active_status", status);
  };

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.status}
              onClick={() => changeTab(tab.status)}
              className={`text-sm px-4 py-2 font-medium transition-colors duration-150 whitespace-nowrap ${
                activeStatus === tab.status
                  ? "text-docuhealth-primary border-b-2 border-docuhealth-primary font-semibold"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* Search + Sort row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Search patient's name..."
            />
          </div>

          <div className="shrink-0 w-full sm:w-48">
            {/* Select's button is py-3 (46px) and SearchBar's input is py-2 (38px); trim the button so the two match. */}
            <Select
              value={ordering}
              onChange={(val) => setOrdering(val)}
              options={SORT_OPTIONS}
              className="[&>button]:py-2"
            />
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" role="status" aria-label="Loading scan orders">
            {Array.from({ length: 6 }, (_, i) => (
              <ScanRequestCardSkeleton key={i} />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ScanLine size={36} className="opacity-25 mb-2" />
            <p className="text-sm">No scan orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {requests.map((order) => (
              <ScanRequestCard
                key={order.sqid}
                order={order}
                badge={getBadge(order, activeStatus)}
                onViewDetails={() =>
                  navigate("/hospital-radiology-scan-detail", {
                    state: { order, fromStatus: activeStatus },
                  })
                }
              />
            ))}
          </div>
        )}

        <Pagination2
          count={count}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};

export default Hospital_Radiology_Requests_Dashboard;
