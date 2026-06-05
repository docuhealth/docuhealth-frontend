import { useState, useMemo, useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import Pagination2 from "../../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";
import SearchBar from "../../../Components/SearchBar/SearchBar";
import { LabHealthPersonnelContext } from "../../../context/HospitalContext/Lab/LabHealthPersonnelContext";

const ROLE_TABS = [
  { label: "All", value: "" },
  { label: "Doctors", value: "doctor" },
  { label: "Nurses", value: "nurse" },
  { label: "Lab Scientists", value: "lab scientist" },
  { label: "Receptionists", value: "receptionist" },
];

const Hospital_Lab_HealthPersonnel_Dashboard = () => {
  const {
    healthPersonnelList,
    fetchHealthPersonnel,
    loading,
    count,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useContext(LabHealthPersonnelContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Client-side filter on the current page's data
  const filtered = useMemo(() => {
    return healthPersonnelList.filter((s) => {
      const fullName = `${s.firstname || ""} ${s.lastname || ""}`.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        fullName.includes(searchQuery.toLowerCase()) ||
        (s.phone || "").includes(searchQuery) ||
        (s.role || "").includes(searchQuery.toLowerCase()) ||
        (s.staff_id || s.staffId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.email || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = !selectedRole || s.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [healthPersonnelList, searchQuery, selectedRole]);

  const handleRoleChange = (value) => {
    setSelectedRole(value);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchHealthPersonnel(page);
  };

  const displayName = (staff) =>
    staff.role === "doctor"
      ? `Dr. ${staff.firstname || ""} ${staff.lastname || ""}`.trim()
      : `${staff.firstname || ""} ${staff.lastname || ""}`.trim();

  return (
    <>
      <div className="py-2 text-sm flex justify-between items-center">
        <DynamicDate />
      </div>

      <div className="bg-white my-5 rounded-lg">
        <div className="border rounded-lg p-4 lg:p-6">
          <h2 className="mb-4 pb-2 border-b font-medium">Health Personnel List</h2>

          {/* Search + Role filter */}
          <div className="mb-4 w-full">
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by name, role, staff ID, or phone number..."
            />
            <div className="flex gap-2 mt-3 flex-wrap">
              {ROLE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleRoleChange(tab.value)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    selectedRole === tab.value
                      ? "bg-[#3E4095] text-white border-[#3E4095]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#3E4095] hover:text-[#3E4095]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              <p className="font-medium">No results found.</p>
              <p className="text-xs text-gray-400 mt-1">
                Try a different search term or role filter.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:flex lg:flex-col">
                <div className="grid grid-cols-7 text-left text-sm bg-gray-100 py-5 rounded-md">
                  <div className="col-span-2 pl-5">Name of Staff</div>
                  <p>Staff Id</p>
                  <p>Role</p>
                  <p>Phone no.</p>
                  <p>Email Address</p>
                  <p>Sex</p>
                </div>

                {filtered.map((staff) => (
                  <div
                    key={staff.id}
                    className="grid grid-cols-7 items-center text-[12px] text-gray-700 border-b border-b-gray-200"
                  >
                    <div className="font-semibold col-span-2 py-6 pl-5 flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.6654 12.834H10.4987V11.6673C10.4987 10.7008 9.71522 9.91732 8.7487 9.91732H5.2487C4.2822 9.91732 3.4987 10.7008 3.4987 11.6673V12.834H2.33203V11.6673C2.33203 10.0565 3.63787 8.75065 5.2487 8.75065H8.7487C10.3595 8.75065 11.6654 10.0565 11.6654 11.6673V12.834ZM6.9987 7.58398C5.0657 7.58398 3.4987 6.01698 3.4987 4.08398C3.4987 2.15099 5.0657 0.583984 6.9987 0.583984C8.93169 0.583984 10.4987 2.15099 10.4987 4.08398C10.4987 6.01698 8.93169 7.58398 6.9987 7.58398ZM6.9987 6.41732C8.28734 6.41732 9.33203 5.37265 9.33203 4.08398C9.33203 2.79532 8.28734 1.75065 6.9987 1.75065C5.71003 1.75065 4.66536 2.79532 4.66536 4.08398C4.66536 5.37265 5.71003 6.41732 6.9987 6.41732Z" fill="#647284" />
                      </svg>
                      <p>{displayName(staff)}</p>
                    </div>
                    <p>{staff.staff_id || staff.staffId || "—"}</p>
                    <p className="capitalize">{staff.role || "—"}</p>
                    <p>{staff.phone || "—"}</p>
                    <p className="truncate max-w-[120px]">{staff.email || "—"}</p>
                    <p>{staff.gender || staff.sex || "—"}</p>
                  </div>
                ))}
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden flex flex-col gap-4">
                {filtered.map((staff) => (
                  <div
                    key={staff.id}
                    className="bg-white border border-gray-200 rounded-lg p-5 active:bg-gray-50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3E4095] font-bold text-sm shadow-inner">
                          {staff.firstname?.[0]}{staff.lastname?.[0]}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 text-[15px] truncate">
                            {displayName(staff)}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] bg-[#3E4095] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider capitalize">
                              {staff.role || "—"}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {staff.staff_id || staff.staffId || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-100 px-2 py-1 rounded-lg">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">
                          {staff.gender || staff.sex || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="bg-white p-1.5 rounded-md shadow-sm">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3E4095" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                        </div>
                        <p className="text-[12px] font-medium">{staff.phone || "—"}</p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="bg-white p-1.5 rounded-md shadow-sm">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3E4095" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </div>
                        <p className="text-[12px] font-medium truncate">{staff.email || "—"}</p>
                      </div>
                    </div>

                    <button className="flex-1 w-full bg-[#3E4095] py-2.5 rounded-full flex items-center justify-center gap-2 text-[12px] font-bold text-white">
                      Message
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <Pagination2
            count={count}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default Hospital_Lab_HealthPersonnel_Dashboard;
