import React, { useState, useContext } from 'react'
import { DoctorAppointmentsListContext } from '../../../../../context/Hospital Context/Doctors/DoctorAppointmentsListContext'
import Pagination from '../../../Patient_Dashboard_Components/Pagination/Pagination'
import { formatFullDate, formatTime } from '../../../Patient_Dashboard_Components/Patient_Appointments_Dashboard/Components/Date_Time_Formatter'
import { Link } from 'react-router-dom'

const AppointmentsList = ({setSeePatientDetails, setSelectedPatientDetails}) => {

    const {
        appointments,
        loading,
        count,
        currentPage,
        totalPages,
        fetchAppointments,
    } = useContext(DoctorAppointmentsListContext);

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

    const [openPopover, setOpenPopover] = useState(null);
    const togglePopover = (index) => {
        setOpenPopover(openPopover === index ? null : index);
    };

    return (
        <div className="text-[12px] my-4">
            <div>
                {appointments.map((appointment, index) => (
                    <div
                        key={appointment.id}
                        className="mb-4 p-4 border rounded-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-0 "
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
                            <p>Date / Time: {formatFullDate(appointment.scheduled_time)} / {formatTime(appointment.scheduled_time)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <svg width="20" height="20" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.6654 12.834H10.4987V11.6673C10.4987 10.7008 9.71522 9.91732 8.7487 9.91732H5.2487C4.2822 9.91732 3.4987 10.7008 3.4987 11.6673V12.834H2.33203V11.6673C2.33203 10.0565 3.63787 8.75065 5.2487 8.75065H8.7487C10.3595 8.75065 11.6654 10.0565 11.6654 11.6673V12.834ZM6.9987 7.58398C5.0657 7.58398 3.4987 6.01698 3.4987 4.08398C3.4987 2.15099 5.0657 0.583984 6.9987 0.583984C8.93169 0.583984 10.4987 2.15099 10.4987 4.08398C10.4987 6.01698 8.93169 7.58398 6.9987 7.58398ZM6.9987 6.41732C8.28734 6.41732 9.33203 5.37265 9.33203 4.08398C9.33203 2.79532 8.28734 1.75065 6.9987 1.75065C5.71003 1.75065 4.66536 2.79532 4.66536 4.08398C4.66536 5.37265 5.71003 6.41732 6.9987 6.41732Z" fill="#1B2B40" />
                            </svg>

                            <p>Patient : {appointment.patient.firstname}{" "}
                                {appointment.patient.lastname}</p>
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
                                    d="M9 1V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9ZM20 11H4V19H20V11ZM7 5H4V9H20V5H17V7H15V5H9V7H7V5Z"
                                    fill="#1B2B40"
                                />
                            </svg>

                            <p>Last Visit : {appointment.last_visited || 'NIL'}</p>
                        </div>

                        <div className="flex items-center gap-1">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z" fill="#1B2B40" />
                            </svg>


                            <p>{'Appointed ' + appointment.staff.role.charAt(0).toUpperCase() + appointment.staff.role.slice(1)}
                                : {appointment.staff.firstname}{" "}
                                {appointment.staff.lastname}</p>
                        </div>
                        <div className='flex items-center justify-between relative'>
                            <div className="flex items-center gap-1 w-full">

                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2H20C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22ZM19 20V4H5V20H19ZM7 6H11V10H7V6ZM7 12H17V14H7V12ZM7 16H17V18H7V16ZM13 7H17V9H13V7Z" fill="#1B2B40" />
                                </svg>

                                <p>Note : {appointment.note || 'NIL'}</p>



                            </div>

                            <div
                                onClick={() => {
                                    togglePopover(index)
                                    setSelectedPatientDetails(appointment)
                                }}
                                className={`h-8 w-9 flex justify-center items-center rounded-full cursor-pointer
        ${openPopover === index ? "bg-slate-300" : "hover:bg-gray-200"}
    `}
                            >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M14 8C14 7.45 13.55 7 13 7C12.45 7 12 7.45 12 8C12 8.55 12.45 9 13 9C13.55 9 14 8.55 14 8ZM4 8C4 7.45 3.55 7 3 7C2.45 7 2 7.45 2 8C2 8.55 2.45 9 3 9C3.55 9 4 8.55 4 8ZM9 8C9 7.45 8.55 7 8 7C7.45 7 7 7.45 7 8C7 8.55 7.45 9 8 9C8.55 9 9 8.55 9 8Z"
                                        fill="#1A263E"
                                    />
                                </svg>
                            </div>


                            {
                                openPopover === index && (
                                    <div className="absolute top-10 right-0 mt-2 bg-white border shadow-sm rounded-xs p-2 w-52 z-30">
                                     
                                        <p
                                         className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                                         onClick={()=> {
                                            setSeePatientDetails(true)
                                         }}
                                        >
                                            See patient's details
                                        </p>
                                     
                                       
                                        <p
                                         className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                                        >
                                            Refer Out
                                        </p>
                                       
                                        </div>
                                )
                            }


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
    )
}

export default AppointmentsList