import { useState } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { FlaskConical, ClipboardList, CheckCircle, ArrowUpRight, ArrowDownRight, User, ChevronLeft, ChevronRight } from "lucide-react";

const statCards = [
  {
    title: "Total Lab Requests",
    value: 148,
    trend: 12,
    trendText: "increase from last month",
    icon: <FlaskConical size={20} className="text-blue-500" />,
    bgClass: "bg-blue-100",
  },
  {
    title: "Pending Tests",
    value: 23,
    trend: -5,
    trendText: "decrease from last month",
    icon: <ClipboardList size={20} className="text-amber-500" />,
    bgClass: "bg-amber-100",
  },
  {
    title: "Completed Tests",
    value: 125,
    trend: 18,
    trendText: "increase from last month",
    icon: <CheckCircle size={20} className="text-green-500" />,
    bgClass: "bg-green-100",
  },
];

const recentPatients = [
  { name: "Amara Okafor",    date: "30/05/2026", time: "9:45 AM",  hin: "12*********85", sex: "Female" },
  { name: "Emeka Nwosu",     date: "30/05/2026", time: "10:20 AM", hin: "34*********62", sex: "Male"   },
  { name: "Fatima Bello",    date: "29/05/2026", time: "8:30 AM",  hin: "56*********41", sex: "Female" },
  { name: "Chidi Eze",       date: "29/05/2026", time: "11:15 AM", hin: "78*********29", sex: "Male"   },
  { name: "Ngozi Adeyemi",   date: "28/05/2026", time: "2:00 PM",  hin: "90*********73", sex: "Female" },
  { name: "Yusuf Lawal",     date: "28/05/2026", time: "3:30 PM",  hin: "12*********58", sex: "Male"   },
  { name: "Blessing Obi",    date: "27/05/2026", time: "9:00 AM",  hin: "34*********94", sex: "Female" },
  { name: "Kelechi Nnadi",   date: "27/05/2026", time: "4:45 PM",  hin: "56*********37", sex: "Male"   },
  { name: "Halima Usman",    date: "26/05/2026", time: "10:00 AM", hin: "78*********15", sex: "Female" },
  { name: "Tunde Afolabi",   date: "26/05/2026", time: "1:30 PM",  hin: "90*********82", sex: "Male"   },
  { name: "Chinwe Okonkwo",  date: "25/05/2026", time: "8:00 AM",  hin: "11*********66", sex: "Female" },
  { name: "Musa Garba",      date: "25/05/2026", time: "12:00 PM", hin: "23*********49", sex: "Male"   },
  { name: "Aisha Muhammed",  date: "24/05/2026", time: "3:00 PM",  hin: "45*********31", sex: "Female" },
  { name: "Seun Adeola",     date: "24/05/2026", time: "11:45 AM", hin: "67*********78", sex: "Male"   },
  { name: "Ifeoma Okeke",    date: "23/05/2026", time: "9:30 AM",  hin: "89*********52", sex: "Female" },
  { name: "Bayo Adekoya",    date: "23/05/2026", time: "2:15 PM",  hin: "13*********96", sex: "Male"   },
  { name: "Zainab Sule",     date: "22/05/2026", time: "10:45 AM", hin: "35*********07", sex: "Female" },
  { name: "Obinna Dike",     date: "22/05/2026", time: "4:00 PM",  hin: "57*********43", sex: "Male"   },
  { name: "Adaeze Eze",      date: "21/05/2026", time: "8:15 AM",  hin: "79*********88", sex: "Female" },
  { name: "Ibrahim Salisu",  date: "21/05/2026", time: "1:00 PM",  hin: "91*********24", sex: "Male"   },
];

const PAGE_SIZE = 8;

const Hospital_Lab_Home_Dashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(recentPatients.length / PAGE_SIZE);
  const paginated = recentPatients.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goTo = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <>
      <div className="py-2">
        <DynamicDate />

        {/* Cover Banner */}
        <div className="relative mt-4 w-full h-[200px] sm:h-[250px] lg:h-[300px] rounded-xl bg-linear-to-br from-[#3E4095] to-indigo-400 flex flex-col items-center justify-center border border-gray-300">
          <div className="text-white text-center mb-4 px-4">
            <p className="text-base sm:text-xl font-semibold opacity-90 uppercase tracking-widest">
              Hospital Laboratory
            </p>
            <p className="text-xs sm:text-sm opacity-75 mt-1">Lab Scientist Dashboard</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-md p-4 sm:p-5 flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-sm flex items-center justify-center border ${stat.bgClass}`}>
                {stat.icon}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#1B2B40]">{stat.title}</p>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold text-[#647284] mb-3">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1 flex-wrap">
              <span className={`flex items-center gap-0.5 ${stat.trend >= 0 ? "text-green-500" : "text-red-500"}`}>
                {stat.trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(stat.trend)}%
              </span>{" "}
              {stat.trendText}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Patients Table */}
      <div className="mt-8 bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
        <h3 className="text-xs sm:text-sm font-semibold text-[#1B2B40] mb-5">Recent patients attended to</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[480px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 min-w-[140px]">Patient&apos;s name</th>
                <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 min-w-[100px]">Date</th>
                <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 min-w-[90px]">Time</th>
                <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 min-w-[120px]">HIN</th>
                <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 min-w-[60px]">Sex</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 flex items-center gap-2">
                    <User size={15} className="text-gray-400 shrink-0" />
                    <span className="truncate">{p.name}</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{p.date}</td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{p.time}</td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{p.hin}</td>
                  <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{p.sex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5">
          <p className="text-xs text-gray-400">
            Showing page {currentPage} to {Math.min(currentPage * PAGE_SIZE, recentPatients.length)} of {recentPatients.length} entries
          </p>

          <div className="flex items-center gap-1 flex-wrap">
            {/* Prev */}
            <button
              onClick={() => goTo(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Page numbers */}
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

            {/* Next */}
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

export default Hospital_Lab_Home_Dashboard;
