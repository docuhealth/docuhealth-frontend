import React, { useState, useEffect, useContext } from "react";
import { AppointmentsContext } from "../../../../context/Patient Context/AppointmentsContext";
import Pagination from "../Pagination/Pagination";
import { formatFullDate, formatTime } from "./Components/Date_Time_Formatter";

const PatientAppointmentsList = () => {
  const {
    appointments,
    setAppointments,
    loading,
    count,
    setCount,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    fetchAppointments,
  } = useContext(AppointmentsContext);

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
            with any doctor, we’ll notify you once you have any new update!
          </p>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="text-[12px] my-4">
        <div>
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="mb-4 p-4 border rounded-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-0 "
            >
              <div className="flex items-center gap-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 1V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9ZM20 11H4V19H20V11ZM7 5H4V9H20V5H17V7H15V5H9V7H7V5Z"
                    fill="#1B2B40"
                  />
                </svg>
                <p>Date: {formatFullDate(appointment.scheduled_time)}</p>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM13 12H17V14H11V7H13V12Z"
                    fill="#1B2B40"
                  />
                </svg>

                <p>Time: {formatTime(appointment.scheduled_time)}</p>
              </div>
              <div className="flex items-center gap-1 lg:col-span-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 20V14H16V20H19V4H5V20H8ZM10 20H14V16H10V20ZM21 20H23V22H1V20H3V3C3 2.44772 3.44772 2 4 2H20C20.5523 2 21 2.44772 21 3V20ZM11 8V6H13V8H15V10H13V12H11V10H9V8H11Z"
                    fill="#1B2B40"
                  />
                </svg>

                <p>
                  Hospital: {appointment.hospital.firstname}{" "}
                  {appointment.hospital.lastname}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z" fill="#1B2B40"/>
</svg>


                <p>Doctor: {appointment.doctor.firstname}{" "}
                  {appointment.doctor.lastname}</p>
              </div>
              <div className="border-l lg:flex lg:justify-center lg:items-center sm:col-span-2 lg:col-span-1 w-full my-4 lg:my-0">
                <button className="border border-[#0000FF] rounded-full py-2 px-5 w-full lg:w-auto hover:bg-blue-50 transition-all duration-300">
                    <p className="text-[#0000FF]">Send a message</p>
                </button>
              </div>
            </div>
          ))}
        </div>
        <Pagination
          count={count}
          currentPage={currentPage}
          totalPages={totalPages}
          fetchData={fetchAppointments}
        />
      </div>
    </>
  );
};

export default PatientAppointmentsList;
