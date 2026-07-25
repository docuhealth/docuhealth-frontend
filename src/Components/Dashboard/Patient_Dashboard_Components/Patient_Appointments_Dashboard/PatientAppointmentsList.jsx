import React, { useContext, useMemo } from "react";
import { AppointmentsContext } from "../../../../context/PatientContext/AppointmentsContext";
import Pagination2 from "../Pagination/Pagination2";
import { formatFullDate, formatTime } from "./Components/Date_Time_Formatter";
import { CalendarIcon, UserIcon, Building2, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import SearchBar from "../../../../Components/SearchBar/SearchBar";

const PatientAppointmentsList = ({selected}) => {
  const {
    appointments,
    isPending,
    isFetching,
    count,
    currentPage,
    totalPages,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
  } = useContext(AppointmentsContext);

  // Keep client-side sort (by the `selected` prop from parent)
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const dateA = new Date(a.scheduled_time).getTime();
      const dateB = new Date(b.scheduled_time).getTime();
      const nameA = `${a.staff?.firstname} ${a.staff?.lastname}`.toLowerCase();
      const nameB = `${b.staff?.firstname} ${b.staff?.lastname}`.toLowerCase();
      switch (selected) {
        case "Latest": return dateB - dateA;
        case "Oldest": return dateA - dateB;
        case "A-Z": return nameA.localeCompare(nameB);
        case "Z-A": return nameB.localeCompare(nameA);
        default: return 0;
      }
    });
  }, [appointments, selected]);

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-full text-sm">
        Loading appointments ...
      </div>
    );
  }
  if (appointments.length === 0 && !searchQuery && !dateFrom && !dateTo) {
    return (
      <div className="flex flex-col justify-center items-center text-center  h-full">
        <svg
          width="200"
          height="200"
          viewBox="0 0 366 366"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d_1517_47151)">
            <circle cx="183" cy="171" r="159" fill="#DBDBDB" />
          </g>
          <circle cx="183" cy="171" r="132" fill="#F6F6F6" />
          <path
            d="M164.25 114.75V102.25H151.75V114.75H126.75C123.298 114.75 120.5 117.548 120.5 121V221C120.5 224.452 123.298 227.25 126.75 227.25H239.25C242.702 227.25 245.5 224.452 245.5 221V121C245.5 117.548 242.702 114.75 239.25 114.75H214.25V102.25H201.75V114.75H164.25ZM133 158.5H233V214.75H133V158.5ZM133 127.25H151.75V133.5H164.25V127.25H201.75V133.5H214.25V127.25H233V146H133V127.25ZM169.741 164.528L183 177.786L196.257 164.528L205.097 173.366L191.839 186.626L205.096 199.883L196.258 208.721L183 195.464L169.741 208.721L160.903 199.882L174.161 186.626L160.902 173.366L169.741 164.528Z"
            fill="#929AA3"
          />
          <defs>
            <filter
              id="filter0_d_1517_47151"
              x="0"
              y="0"
              width="366"
              height="366"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="12" />
              <feGaussianBlur stdDeviation="12" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0.15 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_1517_47151"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_1517_47151"
                result="shape"
              />
            </filter>
          </defs>
        </svg>

        <h2 className="font-medium pb-1">No upcoming appointment!</h2>
        <div className="max-w-md text-center">
          <p className="text-[12px] text-gray-500">
            {" "}
            You currently don’t have any upcoming appointment/follow-up meeting
            with any doctor, we’ll notify you once you have any new update!
          </p>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="mb-4 w-full">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by doctor or hospital..."
        />
        <div className="flex flex-wrap gap-3 mt-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-docuhealth-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-docuhealth-primary"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Clear dates
            </button>
          )}
        </div>
        {isFetching && (
          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3E4095] rounded-full animate-spin"></span>
            Searching...
          </p>
        )}
      </div>

      {appointments.length === 0 && (searchQuery || dateFrom || dateTo) ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          <p className="font-medium">No results found.</p>
          <p className="text-xs text-gray-400 mt-1">Try a different search term or date range.</p>
        </div>
      ) : (
   <div className="my-4">
      <div className="hidden lg:block">
        {sortedAppointments.map((apt) => (
          <div key={apt.id} className="flex items-center justify-between p-4 mb-4 border border-gray-200 rounded-md transition-shadow bg-white ">
            <div className="flex items-center gap-6 flex-1">
              <InfoGroup icon={<CalendarIcon size={16}/>} label="Date / Time" value={`${formatFullDate(apt.scheduled_time)} | ${formatTime(apt.scheduled_time)}`} />
              <InfoGroup icon={<Building2 size={16}/>} label="Hospital" value={apt?.hospital_info?.name} />
              <InfoGroup icon={<UserIcon size={16}/>} label="Doctor" value={`Dr. ${apt?.staff?.firstname} ${apt?.staff?.lastname}`} />
            </div>
            <button 
              onClick={() => toast.success("Coming Soon!")}
              className="border border-docuhealth-primary text-docuhealth-primary rounded-full py-2 px-6 hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              Send message
            </button>
          </div>
        ))}
      </div>

      {/* --- MOBILE VIEW (Vertical Cards) --- */}
      <div className="block lg:hidden space-y-4">
        {sortedAppointments.map((apt) => (
          <div key={apt.id} className="p-4 border border-gray-200 rounded-md bg-white ">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Schedule</p>
                <p className="text-sm font-semibold">{formatFullDate(apt.scheduled_time)}</p>
                <p className="text-xs text-gray-500">{formatTime(apt.scheduled_time)}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <CalendarIcon size={18} className="text-docuhealth-primary" />
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <Building2 size={14} className="text-gray-400" />
                <p className="text-sm text-gray-700">{apt?.hospital_info?.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <UserIcon size={14} className="text-gray-400" />
                <p className="text-sm text-gray-700">Dr. {apt?.staff?.firstname} {apt?.staff?.lastname}</p>
              </div>
            </div>

            <button 
              onClick={() => toast.success("Coming Soon!")}
              className="w-full flex items-center justify-center gap-2 bg-docuhealth-primary text-white rounded-full py-2.5 text-[13px] font-medium"
            >
              <MessageSquare size={16} />
              Send a message
            </button>
          </div>
        ))}
      </div>

      <Pagination2
        count={count}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
    )}
    </>
  );
};

const InfoGroup = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 min-w-[150px]">
    <div className="p-2 bg-gray-100 rounded-md text-gray-600">{icon}</div>
    <div>
      <p className="text-[10px] text-gray-400 uppercase font-bold">{label}</p>
      <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">{value || "N/A"}</p>
    </div>
  </div>
);


export default PatientAppointmentsList;
