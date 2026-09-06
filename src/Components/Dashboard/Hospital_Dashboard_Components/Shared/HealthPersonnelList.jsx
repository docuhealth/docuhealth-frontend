import { useContext } from "react";
import { HosStaffsContext } from "../../../../context/HospitalContext/HosStaffsContext";
import Pagination2 from "../../Patient_Dashboard_Components/Pagination/Pagination2";
import SearchBar from "../../../SearchBar/SearchBar";

const ROLE_TABS = [
  { label: "All",           value: "" },
  { label: "Doctors",       value: "doctor" },
  { label: "Nurses",        value: "nurse" },
  { label: "Receptionists", value: "receptionist" },
  { label: "Pharmacists",   value: "pharmacist" },
  { label: "Lab Scientists",value: "lab_scientist" },
];

const displayName = (staff) =>
  staff.role === "doctor"
    ? `Dr. ${staff.firstname || ""} ${staff.lastname || ""}`.trim()
    : `${staff.firstname || ""} ${staff.lastname || ""}`.trim();

const PersonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.6654 12.834H10.4987V11.6673C10.4987 10.7008 9.71522 9.91732 8.7487 9.91732H5.2487C4.2822 9.91732 3.4987 10.7008 3.4987 11.6673V12.834H2.33203V11.6673C2.33203 10.0565 3.63787 8.75065 5.2487 8.75065H8.7487C10.3595 8.75065 11.6654 10.0565 11.6654 11.6673V12.834ZM6.9987 7.58398C5.0657 7.58398 3.4987 6.01698 3.4987 4.08398C3.4987 2.15099 5.0657 0.583984 6.9987 0.583984C8.93169 0.583984 10.4987 2.15099 10.4987 4.08398C10.4987 6.01698 8.93169 7.58398 6.9987 7.58398ZM6.9987 6.41732C8.28734 6.41732 9.33203 5.37265 9.33203 4.08398C9.33203 2.79532 8.28734 1.75065 6.9987 1.75065C5.71003 1.75065 4.66536 2.79532 4.66536 4.08398C4.66536 5.37265 5.71003 6.41732 6.9987 6.41732Z" fill="var(--color-docuhealth-secondary)" />
  </svg>
);

const EmptyState = ({ selectedRole }) => (
  <div className="flex flex-col justify-center items-center text-center h-full py-12">
    <svg width="180" height="180" viewBox="0 0 366 366" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d_1517_47151)">
        <circle cx="183" cy="171" r="159" fill="#DBDBDB" />
      </g>
      <circle cx="183" cy="171" r="132" fill="#F6F6F6" />
      <path d="M164.25 114.75V102.25H151.75V114.75H126.75C123.298 114.75 120.5 117.548 120.5 121V221C120.5 224.452 123.298 227.25 126.75 227.25H239.25C242.702 227.25 245.5 224.452 245.5 221V121C245.5 117.548 242.702 114.75 239.25 114.75H214.25V102.25H201.75V114.75H164.25ZM133 158.5H233V214.75H133V158.5ZM133 127.25H151.75V133.5H164.25V127.25H201.75V133.5H214.25V127.25H233V146H133V127.25ZM169.741 164.528L183 177.786L196.257 164.528L205.097 173.366L191.839 186.626L205.096 199.883L196.258 208.721L183 195.464L169.741 208.721L160.903 199.882L174.161 186.626L160.902 173.366L169.741 164.528Z" fill="#929AA3" />
      <defs>
        <filter id="filter0_d_1517_47151" x="0" y="0" width="366" height="366" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="12" />
          <feGaussianBlur stdDeviation="12" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0.15 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1517_47151" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1517_47151" result="shape" />
        </filter>
      </defs>
    </svg>
    <h2 className="font-medium pb-1">
      {selectedRole
        ? `No ${ROLE_TABS.find((t) => t.value === selectedRole)?.label || "Health Personnel"}!`
        : "No available health personnel!"}
    </h2>
    <p className="text-[12px] text-gray-500 max-w-md text-center">
      {selectedRole
        ? `You currently don't have any ${(ROLE_TABS.find((t) => t.value === selectedRole)?.label || "health personnel").toLowerCase()}.`
        : "You currently don't have any health personnel."}
    </p>
  </div>
);

const MobileCard = ({ staff, isAdmin }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-5 active:bg-gray-50 transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-docuhealth-primary font-bold text-sm shadow-inner">
          {staff.firstname?.[0]}{staff.lastname?.[0]}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 text-[15px] truncate">{displayName(staff)}</h3>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-docuhealth-primary text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {staff.role || "Staff"}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">#{staff.staff_id || "N/A"}</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-100 px-2 py-1 rounded-lg">
        <p className="text-[10px] text-gray-500 font-bold uppercase">{staff.gender || "—"}</p>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 text-gray-600">
        <div className="bg-white p-1.5 rounded-md shadow-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-docuhealth-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </div>
        <p className="text-[12px] font-medium">{staff.phone_num || "No Phone"}</p>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <div className="bg-white p-1.5 rounded-md shadow-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-docuhealth-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </div>
        <p className="text-[12px] font-medium truncate">{staff.email || "No Email"}</p>
      </div>
    </div>

    <div className="flex gap-2">
      <button className="flex-1 bg-docuhealth-primary py-2.5 rounded-full flex items-center justify-center gap-2 text-[12px] font-bold text-white">
        Message
      </button>
      {isAdmin && (
        <button className="flex-1 border border-docuhealth-primary text-docuhealth-primary py-2.5 rounded-full flex items-center justify-center gap-2 text-[12px] font-bold hover:bg-indigo-50 transition-colors">
          Edit
        </button>
      )}
    </div>
  </div>
);

const HealthPersonnelList = ({ isAdmin = false }) => {
  const {
    staffs: healthPersonnelList,
    loading,
    isRefreshing,
    count,
    currentPage,
    totalPages,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    selectedRole,
    setSelectedRole,
  } = useContext(HosStaffsContext);

  if (loading) {
    return <div className="flex justify-center items-center h-full text-sm py-12">Loading...</div>;
  }



  const colCount = isAdmin ? 8 : 7;

  return (
    <>
      <div className="mb-4 w-full">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name or email..."
        />
        {isRefreshing && (
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3E4095] rounded-full animate-spin" />
            Searching...
          </p>
        )}
        <div className="flex gap-2 mt-3 flex-wrap">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedRole(tab.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                selectedRole === tab.value
                  ? "bg-docuhealth-primary text-white border-docuhealth-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:border-docuhealth-primary hover:text-docuhealth-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {healthPersonnelList.length === 0 && searchQuery ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          <p className="font-medium">No results found for "{searchQuery}"</p>
          <p className="text-xs text-gray-400 mt-1">Try a different search term.</p>
        </div>
      ) : healthPersonnelList.length === 0 && !searchQuery ? (
        <EmptyState selectedRole={selectedRole} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:flex lg:flex-col">
            <div className={`grid grid-cols-${colCount} text-left text-sm bg-gray-100 py-5 rounded-md`}>
              <div className="col-span-2 pl-5">Name of Staff</div>
              <p>Staff Id</p>
              <p>Role</p>
              <p>Phone no</p>
              <p>Email Address</p>
              <p>Sex</p>
              {isAdmin && <p>Actions</p>}
            </div>
            {healthPersonnelList.map((staff, index) => (
              <div key={staff.id ?? index} className={`grid grid-cols-${colCount} items-center text-[12px] text-gray-700 border-b border-b-gray-200`}>
                <div className="font-semibold col-span-2 py-6 pl-5 flex items-center gap-1">
                  <PersonIcon />
                  <p>{displayName(staff)}</p>
                </div>
                <p>{staff.staff_id || "—"}</p>
                <p className="capitalize">{staff.role || "—"}</p>
                <p>{staff.phone_num || "—"}</p>
                <p className="truncate max-w-[120px]">{staff.email || "—"}</p>
                <p>{staff.gender || "—"}</p>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button className="text-docuhealth-primary text-xs font-medium hover:underline">Edit</button>
                    <button className="text-red-500 text-xs font-medium hover:underline">Remove</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden flex flex-col gap-4">
            {healthPersonnelList.map((staff, index) => (
              <MobileCard key={staff.id ?? index} staff={staff} isAdmin={isAdmin} />
            ))}
          </div>
        </>
      )}

      <Pagination2
        count={count}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
};

export default HealthPersonnelList;
