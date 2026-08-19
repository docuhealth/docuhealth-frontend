import React, { useState, useContext, useMemo } from "react";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";
import { NursesAppointmentsListContext } from "../../../../../context/HospitalContext/Nurses/NursesAppointmentsListContext";
import {
  formatFullDate,
  formatTime,
} from "../../../Patient_Dashboard_Components/Patient_Appointments_Dashboard/Components/Date_Time_Formatter";
import toast from "react-hot-toast";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import { CalendarIcon, User, UserIcon, FileText } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import SearchBar from "../../../../SearchBar/SearchBar";

const AppointmentsList = ({ setNewCaseNote, setCaseNoteHistory, setUpdateVitals, setVitalSignsHistory, setSelectedPatientForVitals, setSelectedPatientForCASE, setSharedSoapNoteHistory, setSelectedPatientForSharedSoap, setSeePatientDetails, setDashboardSelectedPatientDetails }) => {
  const {
    appointments,
    count,
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    appointmentType,
    setAppointmentType,
    searchQuery,
    setSearchQuery,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    isRefreshing,
  } = useContext(NursesAppointmentsListContext);
  const queryClient = useQueryClient();
  const [staffList, setStaffList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    staff_id: "",
    patient_hin: "",
    type: "",
    note: "",
    scheduled_time: "",
  });

  const today = new Date();

  const [selectedDay, setSelectedDay] = useState(String(today.getDate()));
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));
  const [selectedTime, setSelectedTime] = useState("08:00");

  const [openPopover, setOpenPopover] = useState(null);
  const [fetchingPersonnel, setFetchingPersonnel] = useState(false);
  const [isStaffSelected, setIsStaffSelected] = useState(false);

  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);

  const sortedAppointments = useMemo(() => {
    // Sort by proximity to current time (if upcoming)
    if (appointmentType === 'upcoming') {
      const now = new Date().getTime();
      return [...appointments].sort((a, b) => {
        const dateA = new Date(a.scheduled_time).getTime();
        const dateB = new Date(b.scheduled_time).getTime();
        return Math.abs(dateA - now) - Math.abs(dateB - now);
      });
    }

    // For history, sort by most recent past first
    return [...appointments].sort((a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime());

  }, [appointments, appointmentType]);

  const togglePopover = (index) => {
    setOpenPopover(openPopover === index ? null : index);
  };

  const fetchHealthPersonnel = async () => {
    setFetchingPersonnel(true);
    try {
      const res = await axiosInstanceHos.get(`api/receptionists/staff/doctor`);
      const data = res.data;

      console.log(res.data);
      // Check if empty
      if (!data || data.length === 0) {
        toast.error(`No doctors currently available.`);
        setFetchingPersonnel(false);
        return;
      }
      setStaffList(data);
      toast.success(`Doctors fetched successfully.`);
      setOpenPopover(null);
    } catch (err) {
      console.error("Error fetching medical personnel:", err);
      toast.error(
        err.response?.data?.message || "Error fetching medical personnel.",
      );
    } finally {
      setFetchingPersonnel(false);
    }
  };

  const handleAssign = (staffId) => {
    setIsStaffSelected(true); // show next card

    setFormData((prev) => ({
      ...prev,
      staff_id: staffId,
    }));
  };

  const assignDoctorMutation = useMutation({
    mutationFn: (payload) =>
      axiosInstanceHos.patch(
        `api/nurses/appointments/${selectedPatientDetails.id}/assign`,
        payload,
      ),
    onSuccess: () => {
      toast.success("Consultation booked successfully!");
      queryClient.invalidateQueries({ queryKey: ["nurse-appointments"] });

      setIsStaffSelected(false);
      setOpenPopover(null);
    },
    onError: (err) => {
      console.error("Error booking consultation:", err);
      toast.error(err.response?.data?.message || "Error booking consultation.");
    },
  });

  const handleRequest = async () => {
    // Basic Validation
    if (
      !formData.type ||
      !selectedDay ||
      !selectedMonth ||
      !selectedTime ||
      !selectedYear ||
      !formData.note
    ) {
      return toast.error("Please fill all details.");
    }

    const selectedDate = new Date(
      `${selectedMonth} ${selectedDay}, ${selectedYear} ${selectedTime}`,
    );

    const payload = {
      note: formData.note,
      type: formData.type,
      doctor_id: formData.staff_id,
      scheduled_time: selectedDate.toISOString(),
    };

    // Execute the mutation
    assignDoctorMutation.mutate(payload);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-sm">
        Loading...
      </div>
    );
  }
  if (appointments.length === 0 && !searchQuery && !dateFrom && !dateTo) {
    return (
      <div className="flex flex-col justify-center items-center text-center  h-full pb-10">
        <div className="w-full mb-8 md:border-b md:border-gray-200">
          <div className="grid grid-cols-2 gap-3 md:flex md:flex-row md:gap-8">
            <button
              onClick={() => setAppointmentType('today')}
              className={`px-2 sm:px-4 py-2 text-center text-[13px] sm:text-sm font-medium transition-colors md:-mb-[1px] ${
                appointmentType === 'today'
                  ? 'bg-docuhealth-primary text-white rounded-md md:bg-transparent md:text-docuhealth-primary md:border-b-2 md:border-docuhealth-primary md:rounded-none'
                  : 'text-gray-500 hover:text-gray-700 md:border-b-2 md:border-transparent'
              }`}
            >
              Today's Appointments
            </button>
            <button
              onClick={() => setAppointmentType('upcoming')}
              className={`px-2 sm:px-4 py-2 text-center text-[13px] sm:text-sm font-medium transition-colors md:-mb-[1px] ${
                appointmentType === 'upcoming'
                  ? 'bg-docuhealth-primary text-white rounded-md md:bg-transparent md:text-docuhealth-primary md:border-b-2 md:border-docuhealth-primary md:rounded-none'
                  : 'text-gray-500 hover:text-gray-700 md:border-b-2 md:border-transparent'
              }`}
            >
              Upcoming Appointments
            </button>
            <button
              onClick={() => setAppointmentType('history')}
              className={`px-2 sm:px-4 py-2 text-center text-[13px] sm:text-sm font-medium transition-colors md:-mb-[1px] ${
                appointmentType === 'history'
                  ? 'bg-docuhealth-primary text-white rounded-md md:bg-transparent md:text-docuhealth-primary md:border-b-2 md:border-docuhealth-primary md:rounded-none'
                  : 'text-gray-500 hover:text-gray-700 md:border-b-2 md:border-transparent'
              }`}
            >
              Past Appointments
            </button>
          </div>
        </div>
        
        {isRefreshing ? (
          <div className="flex justify-center items-center h-40 text-sm text-gray-500 mt-10">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-docuhealth-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading appointments...
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
          width="180"
          height="180"
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

        <h2 className="font-medium pb-1">
          {appointmentType === 'upcoming' ? "No upcoming appointment!" : appointmentType === 'today' ? "No appointments today!" : "No past appointments!"}
        </h2>
        <div className="max-w-md text-center">
          <p className="text-[12px] text-gray-500">
            {" "}
            {appointmentType === 'upcoming'
              ? "You currently don’t have any upcoming appointment/follow-up meeting in this hospital."
              : appointmentType === 'today'
              ? "You currently don’t have any appointment/follow-up meeting today."
              : "No appointment history found for this hospital."}
          </p>
        </div>
      
          </div>
        )}
        </div>
    );
  }

  return (
    <>
      <div className="w-full mb-8 md:border-b md:border-gray-200">
        <div className="grid grid-cols-2 gap-3 md:flex md:flex-row md:gap-8">
          <button
            onClick={() => setAppointmentType('today')}
            className={`px-2 sm:px-4 py-2 text-center text-[13px] sm:text-sm font-medium transition-colors md:-mb-[1px] ${
              appointmentType === 'today'
                ? 'bg-docuhealth-primary text-white rounded-md md:bg-transparent md:text-docuhealth-primary md:border-b-2 md:border-docuhealth-primary md:rounded-none'
                : 'text-gray-500 hover:text-gray-700 md:border-b-2 md:border-transparent'
            }`}
          >
            Today's Appointments
          </button>
          <button
            onClick={() => setAppointmentType('upcoming')}
            className={`px-2 sm:px-4 py-2 text-center text-[13px] sm:text-sm font-medium transition-colors md:-mb-[1px] ${
              appointmentType === 'upcoming'
                ? 'bg-docuhealth-primary text-white rounded-md md:bg-transparent md:text-docuhealth-primary md:border-b-2 md:border-docuhealth-primary md:rounded-none'
                : 'text-gray-500 hover:text-gray-700 md:border-b-2 md:border-transparent'
            }`}
          >
            Upcoming Appointments
          </button>
          <button
            onClick={() => setAppointmentType('history')}
            className={`px-2 sm:px-4 py-2 text-center text-[13px] sm:text-sm font-medium transition-colors md:-mb-[1px] ${
              appointmentType === 'history'
                ? 'bg-docuhealth-primary text-white rounded-md md:bg-transparent md:text-docuhealth-primary md:border-b-2 md:border-docuhealth-primary md:rounded-none'
                : 'text-gray-500 hover:text-gray-700 md:border-b-2 md:border-transparent'
            }`}
          >
            Past Appointments
          </button>
        </div>
      </div>
      <div className="mb-4 w-full space-y-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search patient's name, doctor's name, or notes..."
        />
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-docuhealth-primary focus:border-docuhealth-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-docuhealth-primary focus:border-docuhealth-primary"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              Clear dates
            </button>
          )}
          {isRefreshing && (
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5 w-full">
              <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3E4095] rounded-full animate-spin"></span>
              Searching...
            </p>
          )}
        </div>
      </div>

      {appointments.length === 0 && (searchQuery || dateFrom || dateTo) ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          <p className="font-medium">No results found.</p>
          <p className="text-xs text-gray-400 mt-1">Try a different search term or date range.</p>
        </div>
      ) : (
      <>
      <div className="text-[12px] my-4">
        <div className="hidden lg:block">
          {sortedAppointments.map((appointment, index) => (
            <div
              key={appointment.id}
              className="mb-4 p-4 border rounded-md flex flex-wrap gap-4 lg:gap-10 "
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-md">
                  <CalendarIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">
                    Date / Time
                  </p>
                  <p className="text-sm font-medium">
                    {formatFullDate(appointment.scheduled_time)} /{" "}
                    {formatTime(appointment.scheduled_time)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-md">
                  <UserIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">
                    Patient
                  </p>
                  <p className="text-sm font-medium">
                    {appointment.patient.firstname}{" "}
                    {appointment.patient.lastname}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-md">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">
                    Appointed Nurse
                  </p>
                  <p className="text-sm font-medium">
                    {appointment.staff.firstname} {appointment.staff.lastname}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between relative flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-md">
                    <FileText className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">
                      Note
                    </p>
                    <p className="text-sm font-medium truncate max-w-[150px]">
                      {appointment.note || "NIL"}
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => {
                    togglePopover(index);
                  }}
                  className={` hidden h-8 w-9 lg:flex justify-center items-center rounded-full cursor-pointer
        ${openPopover === index ? "bg-slate-300" : "hover:bg-gray-200"}
    `}
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                  </svg>
                </div>

                {openPopover === index && (
                  <div className="hidden lg:block lg:absolute top-0 lg:top-10 right-0 mt-2 bg-white border shadow-sm rounded-xs p-2 w-52 z-30">
                    <p
                      className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                      onClick={() => {
                        setSeePatientDetails(true);
                        setDashboardSelectedPatientDetails(appointment);
                        setOpenPopover(null);
                      }}
                    >
                      See patient's details
                    </p>
                    <p
                      className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                      onClick={() => {
                        setOpenPopover(null);
                        setNewCaseNote(true)
                        setSelectedPatientForCASE(appointment)
                      }}
                    >
                      Add CASE Note
                    </p>
                    <p
                      className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                      onClick={() => {
                        setOpenPopover(null);
                        setCaseNoteHistory(true)
                        setSelectedPatientForCASE(appointment)
                      }}
                    >
                      CASE Note History
                    </p>
                    <p
                      className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                      onClick={() => {
                        setOpenPopover(null);
                        setSharedSoapNoteHistory(true);
                        setSelectedPatientForSharedSoap(appointment);
                      }}
                    >
                      View Shared SOAP Notes
                    </p>
                    <p
                      className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                      onClick={() => {
                        setOpenPopover(null);
                        setVitalSignsHistory(true);
                        setSelectedPatientForVitals(appointment);
                      }}
                    >
                      Vital Signs History
                    </p>
                    <p
                      className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                      onClick={() => {
                        setUpdateVitals(true);
                        setSelectedPatientForVitals(appointment);
                        setOpenPopover(null);
                      }}
                    >
                      Update vitals
                    </p>

                    <p
                      className={`text-[12px] text-gray-700 p-2 rounded-sm cursor-pointer
    hover:bg-gray-200 
    ${fetchingPersonnel ? "pointer-events-none opacity-50" : ""}
  `}
                      onClick={() => {
                        if (!fetchingPersonnel) {
                          setSeePatientDetails(true);
                          setDashboardSelectedPatientDetails(appointment);
                          setOpenPopover(null);
                        }
                      }}
                    >
                      {fetchingPersonnel
                        ? "Fetching Doctor…"
                        : "Assign to a Doctor"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="block lg:hidden space-y-4 px-1">
          {sortedAppointments.map((appointment, index) => (
            <div
              key={appointment.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              {/* Mobile Header: Time and Menu */}
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">
                    Scheduled
                  </p>
                  <p className="text-[13px] font-semibold text-slate-700">
                    {formatFullDate(appointment.scheduled_time)} @{" "}
                    {formatTime(appointment.scheduled_time)}
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={() => togglePopover(index)}
                    className={`h-9 w-9 flex items-center justify-center rounded-full ${openPopover === index ? "bg-slate-200" : "bg-gray-50"}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M14 8C14 7.45 13.55 7 13 7C12.45 7 12 7.45 12 8C12 8.55 12.45 9 13 9C13.55 9 14 8.55 14 8ZM4 8C4 7.45 3.55 7 3 7C2.45 7 2 7.45 2 8C2 8.55 2.45 9 3 9C3.55 9 4 8.55 4 8ZM9 8C9 7.45 8.55 7 8 7C7.45 7 7 7.45 7 8C7 8.55 7.45 9 8 9C8.55 9 9 8.55 9 8Z"
                        fill="#1A263E"
                      />
                    </svg>
                  </button>

                  {openPopover === index && (
                    <div className="absolute right-0 top-10 w-56 bg-white border border-slate-100 shadow rounded-lg p-1.5 z-50">
                      <button
                        className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors"
                        onClick={() => {
                          setSeePatientDetails(true);
                          setDashboardSelectedPatientDetails(appointment);
                          setOpenPopover(null);
                        }}
                      >
                        See patient's details
                      </button>
                      <button
                        className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors"
                        onClick={() => {
                          setOpenPopover(null);
                          setNewCaseNote(true)
                          setSelectedPatientForCASE(appointment)
                        }}
                      >
                        Add CASE Note
                      </button>
                      <button
                        className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors"
                        onClick={() => {
                          setOpenPopover(null);
                          setCaseNoteHistory(true)
                          setSelectedPatientForCASE(appointment)
                        }}
                      >
                        CASE Note History
                      </button>
                      <button
                        className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors"
                        onClick={() => {
                          setOpenPopover(null);
                          setSharedSoapNoteHistory(true);
                          setSelectedPatientForSharedSoap(appointment);
                        }}
                      >
                        View Shared SOAP Notes
                      </button>
                      <button
                        className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors"
                        onClick={() => {
                          setOpenPopover(null);
                          setVitalSignsHistory(true);
                          setSelectedPatientForVitals(appointment);
                        }}
                      >
                        Vital Signs History
                      </button>
                      <button
                        className="w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors"
                        onClick={() => {
                          setUpdateVitals(true);
                          setSelectedPatientForVitals(appointment);
                          setOpenPopover(null);
                        }}
                      >
                        Update vitals
                      </button>

                      <button
                        className={`w-full text-left text-sm text-slate-700 hover:bg-slate-50 p-2.5 rounded-lg transition-colors     ${fetchingPersonnel ? "pointer-events-none opacity-50" : ""}`}
                        onClick={() => {
                          if (!fetchingPersonnel) {
                            fetchHealthPersonnel();
                            setDashboardSelectedPatientDetails(appointment);
                          }
                          setOpenPopover(null);
                        }}
                      >
                        {fetchingPersonnel
                          ? "Fetching Doctor…"
                          : "Assign to a Doctor"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Body: Patient & Staff */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-100">
                    {appointment.patient.firstname[0]}
                    {appointment.patient.lastname[0]}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">
                      Patient
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {appointment.patient.firstname}{" "}
                      {appointment.patient.lastname}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">
                      {appointment.staff.role}
                    </p>
                    <p className="text-[13px] text-slate-600">
                      {appointment.staff.firstname}{" "}
                      {appointment.staff.lastname}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">
                      Note
                    </p>
                    <p className="text-[13px] text-slate-600 truncate italic">
                      "{appointment.note || "No notes"}"
                    </p>
                  </div>
                </div>
              </div>
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
      </>)}
      {staffList && staffList.length !== 0 && (
        <>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-5xl w-full relative text-sm">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="font-medium">Choose a preferred doctor</h2>
                {/* Close Button */}
                <div className="">
                  <button
                    onClick={() => setStaffList(null)}
                    className="text-gray-500 hover:text-black"
                  >
                    <i className="bx bx-x text-2xl cursor-pointer"></i>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5 text-sm max-h-[60vh] overflow-y-auto w-full">
                {staffList.map((staff, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div>
                      <div className="flex justify-between items-center border-b pb-5">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-50 p-2 rounded-full">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"
                                fill="var(--color-docuhealth-primary)"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">
                              {staff.firstname + " " + staff.lastname}
                            </p>
                            <p className="text-xs">Doctor</p>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">{staff.staff_id}</p>
                        </div>
                      </div>

                      <div className="w-full pt-8">
                        <button
                          className="w-full rounded-full border py-2 border-docuhealth-primary text-docuhealth-primary cursor-pointer"
                          onClick={() => {
                            handleAssign(staff.staff_id);
                            setStaffList([]);
                          }}
                        >
                          Assign patient
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      {isStaffSelected && (
        <>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative text-sm">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsStaffSelected(false)}
                  className="text-gray-500 hover:text-black"
                >
                  <i className="bx bx-x text-2xl cursor-pointer"></i>
                </button>
              </div>
              {/* Title */}
              <h2 className="text-center font-semibold text-lg text-gray-800">
                Appointment Request
              </h2>
              <p className="text-center text-gray-500 mb-4 text-sm">
                What’s the reason for the request?
              </p>
              <div className="mb-2 text-[12px]">
                <p className="mb-1 text-gray-700 font-medium">
                  Add nursing note:
                </p>
                <textarea
                  className="border rounded-lg w-full  h-[100px] p-3 text-[12px] outline-none focus:border-docuhealth-primary"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="Enter note...."
                ></textarea>
              </div>

              <div className="mb-2 relative ">
                <p className="block text-[12px] font-medium text-gray-700 mb-1">
                  Type :
                </p>
                <select
                  name="type"
                  value={formData.type}
                  onChange={(e) => {
                    setFormData({ ...formData, type: e.target.value });
                    setIsOpen(false); // close when user picks option
                  }}
                  onFocus={() => setIsOpen(true)} // when clicked/focused
                  onBlur={() => setIsOpen(false)} // when closed
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-docuhealth-primary appearance-none cursor-pointer  text-[12px]"
                  required
                >
                  <option value="" selected>
                    Select
                  </option>

                  <option value="consultation">Consultation</option>
                </select>

                {/* Custom dropdown arrow */}
                <div
                  className={`w-3 h-3 text-gray-400 transform transition-transform duration-200 absolute inset-y-8 right-2 ${isOpen ? "rotate-180" : "rotate-0"
                    }`}
                >
                  <svg
                    className="w-3 h-3 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                <div className="relative">
                  <label className="block  pb-1">Day</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-docuhealth-primary appearance-none cursor-pointer  text-[12px] "
                  >
                    {[...Array(31)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-10 right-0 flex items-center pr-2">
                    <svg
                      className="w-3 h-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <label className="block  pb-1">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-docuhealth-primary appearance-none cursor-pointer  text-[12px] "
                  >
                    <option value="January" selected>
                      January
                    </option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-10 right-0 flex items-center pr-2">
                    <svg
                      className="w-3 h-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-[12px] pb-1">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-docuhealth-primary appearance-none cursor-pointer  text-[12px] "
                  >
                    <option value="2025" selected>
                      2025
                    </option>
                    <option value="2026">2026</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-10 right-0 flex items-center pr-2">
                    <svg
                      className="w-3 h-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-[12px] pb-1">Select time</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 focus:outline-hidden focus:border-docuhealth-primary appearance-none cursor-pointer  text-[12px] "
                  >
                    <option value="08:00" selected>
                      08:00 AM
                    </option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-10 right-0 flex items-center pr-2">
                    <svg
                      className="w-3 h-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                disabled={assignDoctorMutation.isPending}
                className={`mt-6 w-full cursor-pointer bg-docuhealth-primary text-white py-2 rounded-full disabled:bg-docuhealth-primary/60 ${assignDoctorMutation.isPending ? "bg-docuhealth-primary/60 cursor-not-allowed" : ""}} text-sm `}
                onClick={handleRequest}
              >
                {assignDoctorMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Processing Request
                  </span>
                ) : (
                  "Proceed"
                )}{" "}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AppointmentsList;
