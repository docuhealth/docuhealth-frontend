import { useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import {
  Search,
  ChevronDown,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { LabRequestsContext } from "../../../context/HospitalContext/Lab/LabRequestsContext";
import LabOrderCard from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/LabOrderCard";

const tabs = ["Pending Test", "In-progress", "Completed test", "Rejected test"];

const getBadgeStyle = (status) => {
  switch (status) {
    case "pending":
      return { label: "New", cls: "bg-green-100 text-green-600" };
    case "in_progress":
      return { label: "In Progress", cls: "bg-amber-100 text-amber-600" };
    case "completed":
      return { label: "Completed", cls: "bg-green-100 text-green-600" };
    case "rejected":
      return { label: "Rejected", cls: "bg-red-100 text-red-500" };
    default:
      return { label: status || "—", cls: "bg-indigo-100 text-indigo-500" };
  }
};

const TAB_STATUS_MAP = {
  "Pending Test": "pending",
  "In-progress": "in_progress",
  "Completed test": "completed",
  "Rejected test": "rejected",
};

const Hospital_Lab_Requests_Dashboard = () => {
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
  } = useContext(LabRequestsContext);

  const goTo = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
        {/* Tabs — mobile: 2×2 pill grid; sm+: underline row */}
        <div className="sm:hidden grid grid-cols-2 gap-2 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-3 text-xs font-medium rounded-lg text-center transition-colors ${
                activeTab === tab
                  ? "bg-[#3E4095] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-6 border-b border-gray-100 mb-5 overflow-x-auto pb-px hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                activeTab === tab
                  ? "text-[#3E4095] border-b-2 border-[#3E4095]"
                  : "text-gray-400 hover:text-gray-600"
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
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-gray-50 outline-none focus:border-[#3E4095] appearance-none cursor-pointer"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.sqid} value={cat.sqid}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}

          <button className="flex items-center gap-1.5 border border-[#3E4095] text-[#3E4095] text-xs font-medium px-3 sm:px-4 py-2 rounded-full hover:bg-indigo-50 transition-colors whitespace-nowrap">
            Sort by: Latest <ChevronDown size={14} />
          </button>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FlaskConical size={36} className="opacity-25 mb-2" />
            <p className="text-sm">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FlaskConical size={36} className="opacity-25 mb-2" />
            <p className="text-sm">No test orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((order) => (
              <LabOrderCard
                key={order.sqid}
                order={order}
                badge={getBadgeStyle(order.status || TAB_STATUS_MAP[activeTab])}
                activeTab={activeTab}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
          <p className="text-xs text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => goTo(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goTo(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  page === currentPage
                    ? "bg-[#3E4095] text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => goTo(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hospital_Lab_Requests_Dashboard;
