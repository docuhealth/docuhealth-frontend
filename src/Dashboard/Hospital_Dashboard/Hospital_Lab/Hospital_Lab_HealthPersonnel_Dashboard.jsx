import { useState } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { User, ChevronDown, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

const filterOptions = ["Nurses", "Doctors", "Receptionist", "Lab Scientists", "Pharmacists"];

const allStaff = [
  { id: 1,  name: "Amara Okafor",   ward: "Emergency ward",  phone: "09060406069", sex: "Female", role: "Nurses"        },
  { id: 2,  name: "Emeka Nwosu",    ward: "General ward",    phone: "08034512678", sex: "Male",   role: "Doctors"       },
  { id: 3,  name: "Fatima Bello",   ward: "ICU",             phone: "07055234901", sex: "Female", role: "Nurses"        },
  { id: 4,  name: "Chidi Eze",      ward: "Pediatric ward",  phone: "09012345678", sex: "Male",   role: "Doctors"       },
  { id: 5,  name: "Ngozi Adeyemi",  ward: "Emergency ward",  phone: "08123456789", sex: "Female", role: "Nurses"        },
  { id: 6,  name: "Yusuf Lawal",    ward: "Surgical ward",   phone: "07098765432", sex: "Male",   role: "Doctors"       },
  { id: 7,  name: "Blessing Obi",   ward: "General ward",    phone: "09060406069", sex: "Female", role: "Receptionist"  },
  { id: 8,  name: "Kelechi Nnadi",  ward: "Lab",             phone: "08056781234", sex: "Male",   role: "Lab Scientists"},
  { id: 9,  name: "Halima Usman",   ward: "Emergency ward",  phone: "09060406069", sex: "Female", role: "Nurses"        },
  { id: 10, name: "Tunde Afolabi",  ward: "Surgical ward",   phone: "07011223344", sex: "Male",   role: "Doctors"       },
  { id: 11, name: "Chinwe Okonkwo", ward: "Pediatric ward",  phone: "09060406069", sex: "Female", role: "Nurses"        },
  { id: 12, name: "Musa Garba",     ward: "Lab",             phone: "08099887766", sex: "Male",   role: "Lab Scientists"},
  { id: 13, name: "Aisha Muhammed", ward: "General ward",    phone: "09060406069", sex: "Female", role: "Receptionist"  },
  { id: 14, name: "Seun Adeola",    ward: "ICU",             phone: "07055112233", sex: "Male",   role: "Doctors"       },
  { id: 15, name: "Ifeoma Okeke",   ward: "Emergency ward",  phone: "09060406069", sex: "Female", role: "Nurses"        },
  { id: 16, name: "Bayo Adekoya",   ward: "Surgical ward",   phone: "08134445566", sex: "Male",   role: "Pharmacists"   },
  { id: 17, name: "Zainab Sule",    ward: "General ward",    phone: "09060406069", sex: "Female", role: "Nurses"        },
  { id: 18, name: "Obinna Dike",    ward: "Lab",             phone: "07099001122", sex: "Male",   role: "Lab Scientists"},
  { id: 19, name: "Adaeze Eze",     ward: "Pediatric ward",  phone: "09060406069", sex: "Female", role: "Nurses"        },
  { id: 20, name: "Ibrahim Salisu", ward: "Emergency ward",  phone: "08022334455", sex: "Male",   role: "Doctors"       },
];

const PAGE_SIZE = 8;

const Hospital_Lab_HealthPersonnel_Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState("Nurses");
  const [showFilter, setShowFilter]     = useState(false);
  const [openMenu, setOpenMenu]         = useState(null);
  const [currentPage, setCurrentPage]   = useState(1);

  const filtered = allStaff.filter((s) => s.role === activeFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterSelect = (opt) => {
    setActiveFilter(opt);
    setShowFilter(false);
    setCurrentPage(1);
  };

  const goTo = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <>
      {/* Date + Filter row */}
      <div className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <DynamicDate />

        {/* Filter by pill */}
        <div className="relative self-start sm:self-auto">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 border border-[#3E4095] text-[#3E4095] text-xs sm:text-sm font-medium px-4 sm:px-5 py-2 rounded-full hover:bg-indigo-50 transition-colors whitespace-nowrap"
          >
            Filter by: {activeFilter}
            <ChevronDown size={15} className={`transition-transform ${showFilter ? "rotate-180" : ""}`} />
          </button>
          {showFilter && (
            <div className="absolute right-0 top-11 w-44 bg-white border border-gray-100 shadow-lg rounded-xl py-1 z-10">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleFilterSelect(opt)}
                  className={`w-full text-left text-sm px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                    activeFilter === opt ? "text-[#3E4095] font-semibold" : "text-gray-600"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main card */}
      <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
        <h3 className="text-xs sm:text-sm font-semibold text-[#1B2B40] mb-5">My staffs</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[480px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="pb-4 pr-4 font-medium text-xs sm:text-sm min-w-[140px]">Name of Staff</th>
                <th className="pb-4 pr-4 font-medium text-xs sm:text-sm min-w-[120px]">Ward</th>
                <th className="pb-4 pr-4 font-medium text-xs sm:text-sm min-w-[120px]">Phone no.</th>
                <th className="pb-4 font-medium text-xs sm:text-sm min-w-[60px]">Sex</th>
                <th className="pb-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-gray-400 text-xs">
                    No staff found
                  </td>
                </tr>
              ) : (
                paginated.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <User size={15} className="text-gray-400 shrink-0" />
                        <span className="truncate">{staff.name}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-xs sm:text-sm text-gray-500">{staff.ward}</td>
                    <td className="py-4 pr-4 text-xs sm:text-sm text-gray-500 whitespace-nowrap">{staff.phone}</td>
                    <td className="py-4 text-xs sm:text-sm text-gray-500">{staff.sex}</td>
                    <td className="py-4 relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === staff.id ? null : staff.id)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {openMenu === staff.id && (
                        <div className="absolute right-6 top-10 w-36 bg-white border border-gray-100 shadow-lg rounded-lg py-1 z-10">
                          <button className="w-full text-left text-xs px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors">
                            View profile
                          </button>
                          <button className="w-full text-left text-xs px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors">
                            Send message
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
                  page === currentPage ? "bg-[#3E4095] text-white" : "text-gray-500 hover:bg-gray-100"
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

export default Hospital_Lab_HealthPersonnel_Dashboard;
