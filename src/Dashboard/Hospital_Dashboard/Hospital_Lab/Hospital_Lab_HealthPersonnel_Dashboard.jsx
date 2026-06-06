import { useState, useMemo, useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import Pagination2 from "../../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";
import SearchBar from "../../../Components/SearchBar/SearchBar";
import { LabHealthPersonnelContext } from "../../../context/HospitalContext/Lab/LabHealthPersonnelContext";
import HealthPersonnelMobileCard from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/HealthPersonnelMobileCard";

const ROLE_TABS = [
  { label: "All", value: "" },
  { label: "Doctors", value: "doctor" },
  { label: "Nurses", value: "nurse" },
  { label: "Lab Scientists", value: "lab_scientist" },
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
                    <p>{staff.phone_num || "—"}</p>
                    <p className="truncate max-w-[150px] xl:max-w-[180px]">{staff.email || "—"}</p>
                    <p>{staff.gender || staff.sex || "—"}</p>
                  </div>
                ))}
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden flex flex-col gap-4">
                {filtered.map((staff) => (
                  <HealthPersonnelMobileCard key={staff.id} staff={staff} displayName={displayName} />
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
