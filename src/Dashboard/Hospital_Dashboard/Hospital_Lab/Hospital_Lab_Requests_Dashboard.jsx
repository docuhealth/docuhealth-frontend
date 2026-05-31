import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { Search, ChevronDown, FlaskConical, Building2, CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";

const tabs = ["Pending Test", "In-progress", "Completed test", "Rejected test"];

const allOrders = [
  /* Pending */
  { id: 1,  name: "Amara Okafor",   hin: "54658*************", test: "Malaria/Typhoid Test",      hospital: "Lagos General Hospital", datetime: "30th, May., 2026/ 9:45 AM",  badge: "New",        badgeType: "new",  tab: "Pending Test"    },
  { id: 2,  name: "Emeka Nwosu",    hin: "31209*************", test: "Full Blood Count",           hospital: "Eko Hospital",           datetime: "30th, May., 2026/ 10:20 AM", badge: "New",        badgeType: "new",  tab: "Pending Test"    },
  { id: 3,  name: "Fatima Bello",   hin: "78432*************", test: "Liver Function Test",        hospital: "Lagos General Hospital", datetime: "29th, May., 2026/ 8:30 AM",  badge: "1 day ago",  badgeType: "old",  tab: "Pending Test"    },
  { id: 4,  name: "Chidi Eze",      hin: "61093*************", test: "Blood Glucose",              hospital: "St. Nicholas Hospital",  datetime: "29th, May., 2026/ 11:15 AM", badge: "1 day ago",  badgeType: "old",  tab: "Pending Test"    },
  { id: 5,  name: "Kelechi Nnadi",  hin: "55871*************", test: "Thyroid Function Test",      hospital: "Eko Hospital",           datetime: "28th, May., 2026/ 4:45 PM",  badge: "2 days ago", badgeType: "old",  tab: "Pending Test"    },
  { id: 6,  name: "Halima Usman",   hin: "44210*************", test: "Widal Test",                 hospital: "Lagos General Hospital", datetime: "27th, May., 2026/ 10:00 AM", badge: "3 days ago", badgeType: "old",  tab: "Pending Test"    },
  { id: 7,  name: "Musa Garba",     hin: "22987*************", test: "Hepatitis B Screen",         hospital: "Eko Hospital",           datetime: "26th, May., 2026/ 12:00 PM", badge: "4 days ago", badgeType: "old",  tab: "Pending Test"    },
  { id: 8,  name: "Zainab Sule",    hin: "39012*************", test: "Electrolytes & Urea",        hospital: "St. Nicholas Hospital",  datetime: "25th, May., 2026/ 10:45 AM", badge: "5 days ago", badgeType: "old",  tab: "Pending Test"    },
  { id: 9,  name: "Chinwe Okonkwo", hin: "10293*************", test: "Urinalysis",                 hospital: "Lagos General Hospital", datetime: "24th, May., 2026/ 8:00 AM",  badge: "1 week ago", badgeType: "old",  tab: "Pending Test"    },

  /* In-progress */
  { id: 10, name: "Ngozi Adeyemi",  hin: "90347*************", test: "Malaria RDT",               hospital: "Eko Hospital",           datetime: "30th, May., 2026/ 2:00 PM",  badge: "Doctor request", badgeType: "request", tab: "In-progress" },
  { id: 11, name: "Yusuf Lawal",    hin: "67812*************", test: "Hepatitis B Screen",        hospital: "Lagos General Hospital", datetime: "29th, May., 2026/ 3:30 PM",  badge: "Appointment",    badgeType: "appt",    tab: "In-progress" },
  { id: 12, name: "Seun Adeola",    hin: "48239*************", test: "Full Blood Count",          hospital: "St. Nicholas Hospital",  datetime: "28th, May., 2026/ 11:45 AM", badge: "Doctor request", badgeType: "request", tab: "In-progress" },
  { id: 13, name: "Obinna Dike",    hin: "72910*************", test: "Kidney Function Test",      hospital: "Eko Hospital",           datetime: "27th, May., 2026/ 4:00 PM",  badge: "Appointment",    badgeType: "appt",    tab: "In-progress" },
  { id: 20, name: "Chinwe Okonkwo", hin: "10293*************", test: "Urinalysis",                hospital: "Lagos General Hospital", datetime: "27th, May., 2026/ 9:00 AM",  badge: "Appointment",    badgeType: "appt",    tab: "In-progress" },
  { id: 21, name: "Kelechi Nnadi",  hin: "55871*************", test: "Thyroid Function Test",     hospital: "Eko Hospital",           datetime: "26th, May., 2026/ 4:45 PM",  badge: "Doctor request", badgeType: "request", tab: "In-progress" },

  /* Completed */
  { id: 14, name: "Blessing Obi",   hin: "33478*************", test: "HIV Screening",             hospital: "Lagos General Hospital", datetime: "27th, May., 2026/ 9:00 AM",  badge: "Completed", badgeType: "completed", tab: "Completed test" },
  { id: 15, name: "Tunde Afolabi",  hin: "58103*************", test: "Electrolytes & Urea",       hospital: "St. Nicholas Hospital",  datetime: "26th, May., 2026/ 1:30 PM",  badge: "Completed", badgeType: "completed", tab: "Completed test" },
  { id: 16, name: "Ifeoma Okeke",   hin: "81726*************", test: "Malaria/Typhoid Test",      hospital: "Eko Hospital",           datetime: "25th, May., 2026/ 9:30 AM",  badge: "Completed", badgeType: "completed", tab: "Completed test" },
  { id: 17, name: "Adaeze Eze",     hin: "27659*************", test: "Urinalysis",                hospital: "Lagos General Hospital", datetime: "23rd, May., 2026/ 8:15 AM",  badge: "Completed", badgeType: "completed", tab: "Completed test" },
  { id: 22, name: "Halima Usman",   hin: "44210*************", test: "Widal Test",                hospital: "Lagos General Hospital", datetime: "24th, May., 2026/ 10:00 AM", badge: "Completed", badgeType: "completed", tab: "Completed test" },
  { id: 23, name: "Musa Garba",     hin: "22987*************", test: "Hepatitis B Screen",        hospital: "Eko Hospital",           datetime: "23rd, May., 2026/ 12:00 PM", badge: "Completed", badgeType: "completed", tab: "Completed test" },

  /* Rejected */
  { id: 18, name: "Ibrahim Salisu", hin: "91024*************", test: "Blood Culture",             hospital: "St. Nicholas Hospital",  datetime: "29th, May., 2026/ 1:00 PM",  badge: "Rejected", badgeType: "rejected", tab: "Rejected test" },
  { id: 19, name: "Bayo Adekoya",   hin: "64308*************", test: "Sputum Culture",            hospital: "Eko Hospital",           datetime: "26th, May., 2026/ 2:15 PM",  badge: "Rejected", badgeType: "rejected", tab: "Rejected test" },
  { id: 24, name: "Zainab Sule",    hin: "39012*************", test: "Electrolytes & Urea",       hospital: "St. Nicholas Hospital",  datetime: "25th, May., 2026/ 10:45 AM", badge: "Rejected", badgeType: "rejected", tab: "Rejected test" },
  { id: 25, name: "Seun Adeola",    hin: "48239*************", test: "Full Blood Count",          hospital: "Lagos General Hospital", datetime: "24th, May., 2026/ 11:45 AM", badge: "Rejected", badgeType: "rejected", tab: "Rejected test" },
  { id: 26, name: "Fatima Bello",   hin: "78432*************", test: "Liver Function Test",       hospital: "Eko Hospital",           datetime: "23rd, May., 2026/ 8:30 AM",  badge: "Rejected", badgeType: "rejected", tab: "Rejected test" },
  { id: 27, name: "Chidi Eze",      hin: "61093*************", test: "Blood Glucose",             hospital: "St. Nicholas Hospital",  datetime: "22nd, May., 2026/ 11:15 AM", badge: "Rejected", badgeType: "rejected", tab: "Rejected test" },
];

const PAGE_SIZE = 6;

const Hospital_Lab_Requests_Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]     = useState("Pending Test");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch]   = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = allOrders.filter(
    (o) =>
      o.tab === activeTab &&
      (o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.test.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
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

        {/* Tabs — scrollable on mobile */}
        <div className="flex items-center gap-4 sm:gap-6 border-b border-gray-100 mb-5 overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
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
          {/* Search */}
          <div className="flex items-center gap-2">
            {showSearch && (
              <input
                autoFocus
                type="text"
                placeholder="Search patient or test..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#3E4095] w-40 sm:w-48 transition-all"
              />
            )}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-full hover:bg-gray-50 transition-colors"
            >
              <Search size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Sort */}
          <button className="flex items-center gap-1.5 border border-[#3E4095] text-[#3E4095] text-xs font-medium px-3 sm:px-4 py-2 rounded-full hover:bg-indigo-50 transition-colors whitespace-nowrap">
            Sort by: Latest <ChevronDown size={14} />
          </button>
        </div>

        {/* Cards Grid */}
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FlaskConical size={36} className="opacity-25 mb-2" />
            <p className="text-sm">No test orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                {/* Card Header */}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[#1B2B40] truncate">{order.name}</p>
                  <span
                    className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${
                      order.badgeType === "new" || order.badgeType === "completed"
                        ? "bg-green-100 text-green-600"
                        : order.badgeType === "request" || order.badgeType === "appt"
                        ? "bg-amber-100 text-amber-600"
                        : order.badgeType === "rejected"
                        ? "bg-red-100 text-red-500"
                        : "bg-indigo-100 text-indigo-500"
                    }`}
                  >
                    {order.badge}
                  </span>
                </div>

                {/* HIN */}
                <p className="text-xs text-gray-400">HIN:{order.hin}</p>

                {/* Divider */}
                <hr className="border-gray-100" />

                {/* Info rows */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FlaskConical size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate">{order.test}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Building2 size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate">{order.hospital}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CalendarClock size={14} className="text-gray-400 shrink-0" />
                    <span>{order.datetime}</span>
                  </div>
                </div>

                {/* View details button */}
                <button
                  onClick={() => navigate("/hospital-lab-test-detail", { state: { order } })}
                  className="mt-1 w-full border border-gray-300 text-sm text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View details
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
          <p className="text-xs text-gray-400">
            Showing page {currentPage} to {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} entries
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
