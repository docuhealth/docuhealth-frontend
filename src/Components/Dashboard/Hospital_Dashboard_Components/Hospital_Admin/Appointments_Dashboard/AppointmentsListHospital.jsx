import React, { useState, useContext, useMemo } from "react";
import { HosAppointmentsContext } from "../../../../../context/HospitalContext/Admin/HosAppointmentsContext";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";
import {
  formatFullDate,
  formatTime,
} from "../../../Patient_Dashboard_Components/Patient_Appointments_Dashboard/Components/Date_Time_Formatter";
import { CalendarIcon,  UserIcon } from "lucide-react";
import SearchBar from "../../../../SearchBar/SearchBar";

const AppointmentsListHospital = () => {
  const {
    appointments,
    loading,
    count,
    currentPage,
    totalPages,
    setCurrentPage,
  } = useContext(HosAppointmentsContext);

  const [searchQuery, setSearchQuery] = useState("");

const processedAppointments = useMemo(() => {
 
  let filtered = appointments.filter((app) => {
    const searchStr = searchQuery.toLowerCase();
    return (
      app.patient.firstname?.toLowerCase().includes(searchStr) ||
      app.patient.lastname?.toLowerCase().includes(searchStr) ||
      app.staff.firstname?.toLowerCase().includes(searchStr) ||
      app.staff.lastname?.toLowerCase().includes(searchStr) ||
      app.staff.role?.toLowerCase().includes(searchStr)
    );
  });

  const now = new Date().getTime();

  return [...filtered].sort((a, b) => {
    const dateA = new Date(a.scheduled_time).getTime();
    const dateB = new Date(b.scheduled_time).getTime();


    return Math.abs(dateA - now) - Math.abs(dateB - now);
  });
}, [appointments, searchQuery]);



  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-sm">
        Loading...
      </div>
    );
  }
  if (appointments.length === 0) {
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
            in this hospital.
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
          placeholder="Search by name, role or email..."
        />
      </div>
      <div className="text-[12px] my-4">
        <div className="hidden lg:block">
          {processedAppointments.map((appointment) => (
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
                  <CalendarIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">
                    Last Visit
                  </p>
                  <p className="text-sm font-medium">
                    {appointment.last_visited || "NIL"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-md">
                  <UserIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">
                    {"Appointed " +
                      appointment.staff.role.charAt(0).toUpperCase() +
                      appointment.staff.role.slice(1)}
                  </p>
                  <p className="text-sm font-medium">
                    {appointment.staff.role === "doctor" ? "Dr. " : ""}{" "}
                    {appointment.staff.firstname} {appointment.staff.lastname}
                  </p>
                </div>
              </div>

              <button
                className="border border-[#3E4095] rounded-full py-2 px-5 w-full lg:w-auto hover:bg-blue-50 transition-all duration-300 cursor-pointer flex-1"
                onClick={() => {
                  toast.success("Coming Soon !");
                }}
              >
                <p className="text-[#3E4095]">Send a message</p>
              </button>
            </div>
          ))}
        </div>

        <div className="block lg:hidden space-y-4 my-4">
          {processedAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white border border-gray-200 rounded-md p-4  transition-transform"
            >
              {/* Header: Date and Time */}
              <div className="flex items-center gap-2 pb-3 border-b border-gray-50 mb-3">
                <div className="bg-blue-50 p-2 rounded-full">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 1V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9ZM20 11H4V19H20V11Z"
                      fill="#3E4095"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    Appointment Schedule
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatFullDate(appointment.scheduled_time)} at{" "}
                    {formatTime(appointment.scheduled_time)}
                  </p>
                </div>
              </div>

              {/* Body: Patient and Doctor Info */}
              <div className="space-y-3 mb-4">
                {/* Patient Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                      {appointment.patient.firstname[0]}
                      {appointment.patient.lastname[0]}
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Patient</p>
                      <p className="text-[13px] font-medium text-gray-700">
                        {appointment.patient.firstname}{" "}
                        {appointment.patient.lastname}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">Last Visit</p>
                    <p className="text-[11px] font-medium text-gray-500">
                      {appointment.last_visited || "NIL"}
                    </p>
                  </div>
                </div>

                {/* Staff Row */}
                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-[#3E4095] flex items-center justify-center text-white">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26003 15 3.41003 18.13 3.41003 22"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">
                      Appointed {appointment.staff.role}
                    </p>
                    <p className="text-[13px] font-medium text-gray-700">
                      {appointment.staff.role === "doctor" ? "Dr. " : ""}{" "}
                      {appointment.staff.firstname} {appointment.staff.lastname}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                className="w-full bg-white border border-[#3E4095] text-[#3E4095] rounded-full py-2.5 text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 active:bg-blue-100 transition-colors"
                onClick={() => toast.success("Coming Soon !")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
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
    </>
  );
};

export default AppointmentsListHospital;
