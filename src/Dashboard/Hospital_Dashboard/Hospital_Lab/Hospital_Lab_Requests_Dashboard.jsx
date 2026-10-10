import { useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import {
  Search,
  ChevronDown,
  FlaskConical,
} from "lucide-react";
import { LabRequestsContext } from "../../../context/HospitalContext/Lab/LabRequestsContext";
import { LabAppContext } from "../../../context/HospitalContext/Lab/LabAppContext";
import LabOrderCard from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/LabOrderCard";
import Pagination2 from "../../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";

const baseTabs = [
  "Pending Test",
  "In-progress",
  "Sample Collected",
  "Result Ready",
  "Rejected test",
];

const getBadgeStyle = (status) => {
  switch (status) {
    case "pending":
    case "partially_pending":
      return { label: "Pending", cls: "bg-amber-100 text-amber-700" };
    case "sample_collected":
    case "partially_sample_collected":
      return { label: "Sample Collected", cls: "bg-blue-100 text-blue-600" };
    case "in_progress":
    case "partially_in_progress":
      return { label: "In Progress", cls: "bg-amber-100 text-amber-600" };
    case "result_ready":
    case "all_ready":
    case "completed":
    case "approved":
    case "accepted":
      return { label: "Result Ready", cls: "bg-green-100 text-green-600" };
    case "partial_ready":
    case "partially_result_ready":
      return { label: "Partial Ready", cls: "bg-indigo-100 text-indigo-600" };
    case "rejected":
    case "all_rejected":
    case "partially_rejected":
      return { label: "Rejected", cls: "bg-red-100 text-red-500" };
    default:
      return { label: status?.replace(/_/g, ' ') || "—", cls: "bg-indigo-100 text-indigo-500 capitalize" };
  }
};

const TAB_STATUS_MAP = {
  "Pending Test": "pending",
  "In-progress": "in_progress",
  "Sample Collected": "sample_collected",
  "Result Ready": "result_ready",
  "Rejected test": "rejected",
  "Result Approval": "result_ready",
};

const isCompletelyResultReady = (order) => {
  const items = order.items_info || order.items;
  if (Array.isArray(items) && items.length > 0) {
    return items.every((i) =>
      ["result_ready", "all_ready", "completed", "ready", "approved", "accepted"].includes(i.status?.toLowerCase())
    );
  }
  const st = (order.aggregate_status || order.status || "").toLowerCase();
  return st === "result_ready" || st === "all_ready" || st === "completed";
};

const resolveOrderStatus = (order, activeTab) => {
  if (activeTab === "Result Approval") {
    return "result_ready";
  }

  const items = order.items_info || order.items;
  if (Array.isArray(items) && items.length > 0) {
    const statuses = items.map((i) => i.status).filter(Boolean);
    if (statuses.length > 0) {
      const unique = [...new Set(statuses)];
      // If all items have the same status, that is the true order status
      if (unique.length === 1) {
        return unique[0];
      }

      const hasResultReady = statuses.some((s) => s === "result_ready" || s === "all_ready" || s === "completed" || s === "approved");
      const hasInProgress = statuses.includes("in_progress");
      const hasSample = statuses.includes("sample_collected");
      const hasPending = statuses.includes("pending");

      // Multi-item with mixed ready and in-progress/pending items
      if (hasResultReady && (hasInProgress || hasSample || hasPending)) {
        return "partial_ready";
      }

      // If items have mixed statuses, check if the current active tab's status matches any item
      const targetStatus = TAB_STATUS_MAP[activeTab];
      if (targetStatus && statuses.includes(targetStatus)) {
        return targetStatus;
      }

      if (hasInProgress) {
        return "in_progress";
      }
      if (hasSample) {
        return "sample_collected";
      }
      if (hasPending) {
        return "pending";
      }
    }
  }

  return order.aggregate_status || order.status || TAB_STATUS_MAP[activeTab] || "pending";
};

const Hospital_Lab_Requests_Dashboard = () => {
  const { isLabAdmin } = useContext(LabAppContext);
  const {
    requests,
    activeTab,
    setActiveTab,
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory,
    ordering,
    setOrdering,
    count,
  } = useContext(LabRequestsContext);

  const tabs = isLabAdmin
    ? [...baseTabs, "Result Approval"]
    : baseTabs;

  const displayedRequests =
    activeTab === "Result Approval"
      ? requests.filter(isCompletelyResultReady)
      : requests;

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-0 sm:overflow-x-auto border-b-0 sm:border-b border-gray-200 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm px-2 sm:px-4 py-2 font-medium transition-colors duration-200 cursor-pointer text-center sm:whitespace-nowrap sm:shrink-0 rounded-lg sm:rounded-none ${
                activeTab === tab
                  ? "bg-docuhealth-primary text-white sm:bg-transparent sm:text-docuhealth-primary sm:border-b-2 sm:border-docuhealth-primary font-semibold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 sm:hover:bg-transparent sm:border-b-2 sm:border-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search + Category + Sort row */}
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 mb-6">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-full sm:w-auto">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search patient or test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs text-gray-600 bg-transparent outline-none flex-1 sm:w-48"
            />
          </div>

          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-gray-50 outline-none focus:border-docuhealth-primary appearance-none cursor-pointer"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.sqid} value={cat.sqid}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}

          <div className="relative inline-block">
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="flex items-center border border-docuhealth-primary text-docuhealth-primary text-xs font-medium pl-4 pr-10 py-2 rounded-full hover:bg-indigo-50 transition-colors whitespace-nowrap appearance-none outline-none cursor-pointer bg-transparent"
            >
              <option value="-created_at">Sort by: Latest</option>
              <option value="created_at">Sort by: Oldest</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-docuhealth-primary pointer-events-none" />
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FlaskConical size={36} className="opacity-25 mb-2" />
            <p className="text-sm">Loading requests...</p>
          </div>
        ) : displayedRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FlaskConical size={36} className="opacity-25 mb-2" />
            <p className="text-sm">
              {activeTab === "Result Approval"
                ? "No test orders awaiting approval found"
                : "No test orders found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayedRequests.map((order) => (
              <LabOrderCard
                key={order.sqid}
                order={order}
                badge={getBadgeStyle(resolveOrderStatus(order, activeTab))}
                activeTab={activeTab}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination2
          count={activeTab === "Result Approval" ? displayedRequests.length : count}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </>
  );
};

export default Hospital_Lab_Requests_Dashboard;
