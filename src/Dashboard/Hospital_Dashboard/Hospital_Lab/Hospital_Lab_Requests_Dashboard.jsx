import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import {
  Search,
  ChevronDown,
  FlaskConical,
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { LabRequestsContext } from "../../../context/HospitalContext/Lab/LabRequestsContext";

const tabs = ["Pending Test", "In-progress", "Completed test", "Rejected test"];

const getBadgeStyle = (status) => {
  switch (status) {
    case "pending":   return { label: "New",       cls: "bg-green-100 text-green-600" };
    case "in_progress": return { label: "In Progress", cls: "bg-amber-100 text-amber-600" };
    case "completed": return { label: "Completed",  cls: "bg-green-100 text-green-600" };
    case "rejected":  return { label: "Rejected",   cls: "bg-red-100 text-red-500" };
    default:          return { label: status || "—", cls: "bg-indigo-100 text-indigo-500" };
  }
};

const TAB_STATUS_MAP = {
  "Pending Test":   "pending",
  "In-progress":    "in_progress",
  "Completed test": "completed",
  "Rejected test":  "rejected",
};

const Hospital_Lab_Requests_Dashboard = () => {
  const navigate = useNavigate();
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
  } = useContext(LabRequestsContext);

  const getPatientName = (order) =>
    order.patient_name ||
    (order.patient ? `${order.patient.firstname || ""} ${order.patient.lastname || ""}`.trim() : "") ||
    order.name ||
    "Unknown";

  const getHIN = (order) => order.patient_hin || order.patient?.hin || order.hin || "—";

  const getTestName = (order) => order.test_name || order.test || "—";

  const getHospital = (order) => order.hospital_name || order.hospital || "—";

  const getDatetime = (order) => {
    if (order.datetime) return order.datetime;
    const raw = order.scheduled_at || order.created_at;
    if (!raw) return "—";
    return new Date(raw).toLocaleString("en-US", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

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
        <div className="flex items-center gap-4 sm:gap-6 border-b border-gray-100 mb-5 overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                activeTab === tab
                  ? "text-[#3E4095] border-b-2 border-[#3E4095]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search + Sort row */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search patient or test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs text-gray-600 bg-transparent outline-none w-40 sm:w-48"
            />
          </div>
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
            {requests.map((order) => {
              const badge = getBadgeStyle(order.status || TAB_STATUS_MAP[activeTab]);
              return (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-[#1B2B40] truncate">
                      {getPatientName(order)}
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400">HIN:{getHIN(order)}</p>

                  <hr className="border-gray-100" />

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FlaskConical size={14} className="text-gray-400 shrink-0" />
                      <span className="truncate">{getTestName(order)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Building2 size={14} className="text-gray-400 shrink-0" />
                      <span className="truncate">{getHospital(order)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarClock size={14} className="text-gray-400 shrink-0" />
                      <span>{getDatetime(order)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate("/hospital-lab-test-detail", {
                        state: {
                          order: {
                            id:       order.sqid || order.id,
                            name:     getPatientName(order),
                            hin:      getHIN(order),
                            test:     getTestName(order),
                            hospital: getHospital(order),
                            datetime: getDatetime(order),
                            tab:      activeTab,
                            requestedBy: order.requested_by ||
                              (order.doctor ? `Dr. ${order.doctor.firstname || ""} ${order.doctor.lastname || ""}`.trim() : undefined),
                            age:    order.patient?.age,
                            gender: order.patient?.sex || order.patient?.gender,
                            email:  order.hospital_email || order.email,
                          },
                        },
                      })
                    }
                    className="mt-1 w-full border border-gray-300 text-xs text-gray-700 py-2 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    View details
                  </button>
                </div>
              );
            })}
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
