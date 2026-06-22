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
import Pagination2 from "../../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";

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
    count,
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
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-5 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm px-2 sm:px-4 py-2 font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === tab
                  ? "text-[#3E4095] border-b-2 border-[#3E4095] font-semibold"
                  : "text-gray-600 hover:text-gray-800"
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

export default Hospital_Lab_Requests_Dashboard;
