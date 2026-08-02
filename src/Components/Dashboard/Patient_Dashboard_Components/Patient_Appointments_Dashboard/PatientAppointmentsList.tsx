import React, { useState, useEffect, useMemo } from "react";
import { usePatientAppointments } from "../../../../hooks/patients/usePatientAppointments";
import { getToken } from "../../../../services/authService";
import useDebounce from "../../../../hooks/useDebounce";
import { keepPreviousData } from "@tanstack/react-query";
import Pagination2 from "../Pagination/Pagination2";
import { formatFullDate, formatTime } from "./Components/Date_Time_Formatter";
import { CalendarIcon, UserIcon, Building2, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import SearchBar from "../../../../Components/SearchBar/SearchBar";
import EmptyState from "../../../../Components/ui/EmptyState";

interface PatientAppointmentsListProps {
  selected: string;
}

const PatientAppointmentsList = ({selected}: PatientAppointmentsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const pageSize = 7;
  const debouncedSearch = useDebounce(searchQuery, 300);
  const isUserLoggedIn = !!getToken();

  const { data, isFetching, isPending, isError, error } = usePatientAppointments(
    currentPage,
    pageSize,
    debouncedSearch,
    dateFrom,
    dateTo,
    {
      enabled: isUserLoggedIn,
      placeholderData: keepPreviousData,
    }
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, dateFrom, dateTo]);

  const appointments = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.ceil(count / pageSize);

  // Keep client-side sort (by the `selected` prop from parent)
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const dateA = new Date(a.scheduled_time || 0).getTime();
      const dateB = new Date(b.scheduled_time || 0).getTime();
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
      <EmptyState
        icon="calendar"
        title="No upcoming appointment!"
        description="You currently don’t have any upcoming appointment/follow-up meeting with any doctor, we’ll notify you once you have any new update!"
      />
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

interface InfoGroupProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
}

const InfoGroup = ({ icon, label, value }: InfoGroupProps) => (
  <div className="flex items-center gap-3 min-w-[150px]">
    <div className="p-2 bg-gray-100 rounded-md text-gray-600">{icon}</div>
    <div>
      <p className="text-[10px] text-gray-400 uppercase font-bold">{label}</p>
      <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">{value || "N/A"}</p>
    </div>
  </div>
);


export default PatientAppointmentsList;
