import React, { useContext } from 'react'
import Pagination from '../../../Patient_Dashboard_Components/Pagination/Pagination'
import { NursesAppointmentsListContext } from '../../../../../context/Hospital Context/Nurses/NursesAppointmentsListContext'
import { formatFullDate, formatTime } from '../../../Patient_Dashboard_Components/Patient_Appointments_Dashboard/Components/Date_Time_Formatter'

const AppointmentsList = () => {

    const {
        appointments,
        loading,
        count,
        currentPage,
        totalPages,
        fetchAppointments,
      } = useContext(NursesAppointmentsListContext);
    
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
                You currently don’t have any upcoming appointment/follow-up meeting in this hospital.
              </p>
            </div>
          </div>
        );
      }

  return (
    <div>AppointmentsList</div>
  )
}

export default AppointmentsList