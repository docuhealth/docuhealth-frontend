import React, { useState, useContext } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../../../utils/axiosInstance";
import Pagination from "../../../Patient_Dashboard_Components/Pagination/Pagination";
import formatRecordDate from "../../../Patient_Dashboard_Components/Home Dashboard/Components/formatRecordDate";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home Dashboard/Components/formatRecordDate";
import { NursesAdmittedPatientMGTContext } from "../../../../../context/Hospital Context/Nurses/NursesAdmittedPatientMGTContext";


const AdmittedPatientsTab = ({advanceCheckUp, setAdvanceCheckUp, setSelected}) => {
    const {
        admittedPatients,
        loading,
        count,
        currentPage,
        totalPages,
        fetchAdmittedPatients,
        tab
    } = useContext(NursesAdmittedPatientMGTContext);
    const [selectedPatient, setSelectedPatient] = useState(null);



    if (loading) {
        return (
            <div className="flex justify-center items-center h-full text-sm">
                Loading...
            </div>
        );
    }

    if (admittedPatients.length === 0) {
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

                <h2 className="font-medium pb-1">No admitted patients!</h2>
                <div className="max-w-md text-center">
                    <p className="text-[12px] text-gray-500">
                        {" "}
                        You currently don’t have any admitted patients.
                    </p>
                </div>
            </div>
        );
    }
    return (
        <>
            <div className='my-4 text-[12px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                {
                    admittedPatients.map((admittedPatient, index) => (
                        <div key={index} className="border p-3 rounded-xl">
                            <div className='flex justify-between items-center'>
                                <p>{admittedPatient.patient.firstname} {admittedPatient.patient.lastname} </p>
                                <div className="bg-[#D2F5DB] px-2 rounded-full">
                                    <p className="text-[#08A913] ">{formatRecordDate(admittedPatient.admission_date)}</p>
                                </div>
                            </div>
                            <div className='border-b py-2'>
                                <p className='text-gray-600'>HIN : {admittedPatient.patient.hin.slice(0, 4) + "••••••" + admittedPatient.patient.hin.slice(-2)}</p>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 pt-3">
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 15 15"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M7.50165 9.24984C9.88142 9.24984 11.8452 11.0312 12.1322 13.3332H2.87109C3.15814 11.0312 5.12187 9.24984 7.50165 9.24984ZM6.44401 10.5795C5.60773 10.8447 4.90335 11.4159 4.46914 12.1665H7.50165L6.44401 10.5795ZM8.55953 10.5797L7.50165 12.1665H10.5342C10.1 11.416 9.39574 10.8448 8.55953 10.5797ZM11.0017 1.6665V5.1665C11.0017 7.0995 9.43464 8.6665 7.50165 8.6665C5.56866 8.6665 4.00166 7.0995 4.00166 5.1665V1.6665H11.0017ZM5.16832 5.1665C5.16832 6.45515 6.21299 7.49984 7.50165 7.49984C8.79035 7.49984 9.83499 6.45515 9.83499 5.1665H5.16832ZM9.83499 2.83317H5.16832L5.16826 3.99984H9.83493L9.83499 2.83317Z"
                                        fill="#1B2B40"
                                    />
                                </svg>
                                <p className="">
                                    {" "}
                                    {admittedPatient?.staff
                                        ? `${admittedPatient.staff.firstname} ${admittedPatient.staff.lastname}`
                                        : "NIL"}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 pt-1 ">
                                <svg width="15" height="15" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4.66634 11.666V8.16602H9.33301V11.666H11.083V2.33268H2.91634V11.666H4.66634ZM5.83301 11.666H8.16634V9.33268H5.83301V11.666ZM12.2497 11.666H13.4163V12.8327H0.583008V11.666H1.74967V1.74935C1.74967 1.42719 2.01084 1.16602 2.33301 1.16602H11.6663C11.9885 1.16602 12.2497 1.42719 12.2497 1.74935V11.666ZM6.41634 4.66602V3.49935H7.58301V4.66602H8.74967V5.83268H7.58301V6.99935H6.41634V5.83268H5.24967V4.66602H6.41634Z" fill="#1B2B40" />
                                </svg>

                                <p className="">
                                    admitted to : {" "}
                                    {admittedPatient?.ward_info
                                        ? `${admittedPatient.ward_info.name} ward`
                                        : "NIL"}
                                </p>
                            </div>

                            <div className="flex items-center gap-1 text-gray-600 pt-1 ">

                                <svg width="15" height="15" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.8337 6.41536V11.6654H11.667V9.91536H2.33366V11.6654H1.16699V2.33203H2.33366V8.16536H7.00033V4.08203H10.5003C11.789 4.08203 12.8337 5.1267 12.8337 6.41536ZM11.667 8.16536V6.41536C11.667 5.77103 11.1447 5.2487 10.5003 5.2487H8.16699V8.16536H11.667ZM4.66699 6.41536C4.98916 6.41536 5.25033 6.15421 5.25033 5.83203C5.25033 5.50987 4.98916 5.2487 4.66699 5.2487C4.34483 5.2487 4.08366 5.50987 4.08366 5.83203C4.08366 6.15421 4.34483 6.41536 4.66699 6.41536ZM4.66699 7.58203C3.7005 7.58203 2.91699 6.79856 2.91699 5.83203C2.91699 4.86554 3.7005 4.08203 4.66699 4.08203C5.63349 4.08203 6.41699 4.86554 6.41699 5.83203C6.41699 6.79856 5.63349 7.58203 4.66699 7.58203Z" fill="#1B2B40" />
                                </svg>


                                <p className="">

                                    {admittedPatient?.bed_info
                                        ? `Bed ${admittedPatient.bed_info.bed_number}`
                                        : "NIL"}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 pt-1 pb-3 border-b">
                                <svg width="15" height="15" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4.08366 1.7487V0.582031H5.25033V1.7487H8.75033V0.582031H9.91699V1.7487H12.2503C12.5725 1.7487 12.8337 2.00987 12.8337 2.33203V5.2487H11.667V2.91536H9.91699V4.08203H8.75033V2.91536H5.25033V4.08203H4.08366V2.91536H2.33366V11.082H5.83366V12.2487H1.75033C1.42816 12.2487 1.16699 11.9875 1.16699 11.6654V2.33203C1.16699 2.00987 1.42816 1.7487 1.75033 1.7487H4.08366ZM9.91699 6.9987C8.62835 6.9987 7.58366 8.04339 7.58366 9.33203C7.58366 10.6207 8.62835 11.6654 9.91699 11.6654C11.2056 11.6654 12.2503 10.6207 12.2503 9.33203C12.2503 8.04339 11.2056 6.9987 9.91699 6.9987ZM6.41699 9.33203C6.41699 7.39904 7.984 5.83203 9.91699 5.83203C11.85 5.83203 13.417 7.39904 13.417 9.33203C13.417 11.265 11.85 12.832 9.91699 12.832C7.984 12.832 6.41699 11.265 6.41699 9.33203ZM9.33366 7.58203V9.57365L10.6712 10.9112L11.4961 10.0862L10.5003 9.09041V7.58203H9.33366Z" fill="#1B2B40" />
                                </svg>


                                <p className="">{formatFullDateTime(admittedPatient.admission_date)}</p>
                            </div>
                            <button className="text-center mt-3 py-2 border bg-[#1B2B40] text-white w-full rounded-full cursor-pointer"
                                onClick={() => setSelectedPatient(admittedPatient)}
                            >
                                View patient's details
                            </button>
                            <button className="text-center mt-3 py-2 border border-[#1B2B40] text-[#1B2B40] w-full rounded-full cursor-pointer"
                                onClick={() => {
                                    setAdvanceCheckUp(true)
                                    setSelected(admittedPatient)
                                }}
                            >
                                Advance Checkup
                            </button>
                        </div>
                    ))
                }
            </div>
            {selectedPatient && (
                <>
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-sm">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative text-sm">
                            <div className='flex justify-end'>
                                <button
                                    onClick={() => setSelectedPatient(null)}
                                    className="text-gray-500 hover:text-black  "
                                >
                                    <i className="bx bx-x text-2xl cursor-pointer"></i>
                                </button>
                            </div>
                            <div className="flex flex-col justify-center items-center">
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.0007 36.6654C10.7959 36.6654 3.33398 29.2034 3.33398 19.9987C3.33398 10.7939 10.7959 3.33203 20.0007 3.33203C29.2053 3.33203 36.6673 10.7939 36.6673 19.9987C36.6673 29.2034 29.2053 36.6654 20.0007 36.6654ZM20.0007 33.332C27.3645 33.332 33.334 27.3625 33.334 19.9987C33.334 12.6349 27.3645 6.66536 20.0007 6.66536C12.6369 6.66536 6.66732 12.6349 6.66732 19.9987C6.66732 27.3625 12.6369 33.332 20.0007 33.332ZM21.6673 17.4987V24.9987H23.334V28.332H16.6673V24.9987H18.334V20.832H16.6673V17.4987H21.6673ZM22.5007 13.332C22.5007 14.7127 21.3813 15.832 20.0007 15.832C18.62 15.832 17.5007 14.7127 17.5007 13.332C17.5007 11.9513 18.62 10.832 20.0007 10.832C21.3813 10.832 22.5007 11.9513 22.5007 13.332Z" fill="#1B2B40" />
                                </svg>
                                <p className="pt-0.5 font-medium">Patient's Details</p>

                            </div>
                            <div className="border rounded-md my-3 p-3 text-[13px] space-y-2">

                                <p>
                                    <strong>Name of patient:</strong>{" "}
                                    {selectedPatient?.patient?.firstname && selectedPatient?.patient?.lastname
                                        ? `${selectedPatient.patient.firstname} ${selectedPatient.patient.lastname}`
                                        : "NIL"}
                                </p>

                                <p>
                                    <strong>Gender:</strong>{" "}
                                    {selectedPatient?.patient?.gender ?? "NIL"}
                                </p>

                                <p>
                                    <strong>D.O.B:</strong>{" "}
                                    {selectedPatient?.patient?.dob
                                        ? formatRecordDate(selectedPatient.patient.dob)
                                        : "NIL"}
                                </p>

                                <p>
                                    <strong>State of Origin:</strong>{" "}
                                    {selectedPatient?.patient?.state_of_origin ?? "NIL"}
                                </p>

                                <p>
                                    <strong>Contact info:</strong>{" "}
                                    {selectedPatient?.patient?.phone ?? "NIL"}
                                </p>

                                <p>
                                    <strong>Address:</strong>{" "}
                                    {selectedPatient?.patient?.address ?? "NIL"}
                                </p>

                                <p>
                                    <strong>Assigned doctor:</strong>{" "}
                                    {selectedPatient?.staff
                                        ? `Dr. ${selectedPatient.staff.firstname} ${selectedPatient.staff.lastname}`
                                        : "NIL"}
                                </p>

                                <p>
                                    <strong>Ward placed:</strong>{" "}
                                    {selectedPatient?.ward_info?.name ?? "NIL"}
                                </p>

                                <p>
                                    <strong>Bed Assigned:</strong>{" "}
                                    {selectedPatient?.bed_info?.bed_number
                                        ? `Bed ${selectedPatient.bed_info.bed_number}`
                                        : "NIL"}
                                </p>

                                <p>
                                    <strong>Date of Admission:</strong>{" "}
                                    {selectedPatient?.admission_date
                                        ? formatFullDateTime(selectedPatient.admission_date)
                                        : "NIL"}
                                </p>

                                <p>
                                    <strong>Date of Discharge:</strong>{" "}
                                    {selectedPatient?.discharge_date
                                        ? formatFullDateTime(selectedPatient.discharge_date)
                                        : "NIL"}
                                </p>

                            </div>

                        </div>

                    </div>
                </>
            )}
            <Pagination count={count}
                currentPage={currentPage}
                totalPages={totalPages}
                fetchData={fetchAdmittedPatients}
                tab={tab} />
        </>
    )
}

const DischargedPatientsTab = () => {

    const {
        admittedPatients,
        loading,
        count,
        currentPage,
        totalPages,
        fetchAdmittedPatients,
        tab
    } = useContext(NursesAdmittedPatientMGTContext);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full text-sm">
                Loading...
            </div>
        );
    }

    if (admittedPatients.length === 0) {
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

                <h2 className="font-medium pb-1">No discharged patients!</h2>
                <div className="max-w-md text-center">
                    <p className="text-[12px] text-gray-500">
                        {" "}
                        You currently don’t have any discharged patients.
                    </p>
                </div>
            </div>
        );
    }


    return (
        <>
            <div className='my-4 text-[12px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                {
                    admittedPatients.map((admittedPatient, index) => (
                        <div key={index} className="border p-3 rounded-xl">
                            <div className='flex justify-between items-center'>
                                <p>{admittedPatient.patient.firstname} {admittedPatient.patient.lastname} </p>
                                <div className="bg-[#D2F5DB] px-2 rounded-full">
                                    <p className="text-[#08A913] ">{formatRecordDate(admittedPatient.request_date)}</p>
                                </div>
                            </div>
                            <div className='border-b py-2'>
                                <p className='text-gray-600'>HIN : {admittedPatient.patient.hin.slice(0, 4) + "••••••" + admittedPatient.patient.hin.slice(-2)}</p>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 pt-3">
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 15 15"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M7.50165 9.24984C9.88142 9.24984 11.8452 11.0312 12.1322 13.3332H2.87109C3.15814 11.0312 5.12187 9.24984 7.50165 9.24984ZM6.44401 10.5795C5.60773 10.8447 4.90335 11.4159 4.46914 12.1665H7.50165L6.44401 10.5795ZM8.55953 10.5797L7.50165 12.1665H10.5342C10.1 11.416 9.39574 10.8448 8.55953 10.5797ZM11.0017 1.6665V5.1665C11.0017 7.0995 9.43464 8.6665 7.50165 8.6665C5.56866 8.6665 4.00166 7.0995 4.00166 5.1665V1.6665H11.0017ZM5.16832 5.1665C5.16832 6.45515 6.21299 7.49984 7.50165 7.49984C8.79035 7.49984 9.83499 6.45515 9.83499 5.1665H5.16832ZM9.83499 2.83317H5.16832L5.16826 3.99984H9.83493L9.83499 2.83317Z"
                                        fill="#1B2B40"
                                    />
                                </svg>
                                <p className="">
                                    {" "}
                                    {admittedPatient?.staff
                                        ? `${admittedPatient.staff.firstname} ${admittedPatient.staff.lastname}`
                                        : "NIL"}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 pt-1 ">
                                <svg width="15" height="15" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4.66634 11.666V8.16602H9.33301V11.666H11.083V2.33268H2.91634V11.666H4.66634ZM5.83301 11.666H8.16634V9.33268H5.83301V11.666ZM12.2497 11.666H13.4163V12.8327H0.583008V11.666H1.74967V1.74935C1.74967 1.42719 2.01084 1.16602 2.33301 1.16602H11.6663C11.9885 1.16602 12.2497 1.42719 12.2497 1.74935V11.666ZM6.41634 4.66602V3.49935H7.58301V4.66602H8.74967V5.83268H7.58301V6.99935H6.41634V5.83268H5.24967V4.66602H6.41634Z" fill="#1B2B40" />
                                </svg>

                                <p className="">
                                    admitted to : {" "}
                                    {admittedPatient?.ward_info
                                        ? `${admittedPatient.ward_info.name} ward`
                                        : "NIL"}
                                </p>
                            </div>

                            <div className="flex items-center gap-1 text-gray-600 pt-1 ">

                                <svg width="15" height="15" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.8337 6.41536V11.6654H11.667V9.91536H2.33366V11.6654H1.16699V2.33203H2.33366V8.16536H7.00033V4.08203H10.5003C11.789 4.08203 12.8337 5.1267 12.8337 6.41536ZM11.667 8.16536V6.41536C11.667 5.77103 11.1447 5.2487 10.5003 5.2487H8.16699V8.16536H11.667ZM4.66699 6.41536C4.98916 6.41536 5.25033 6.15421 5.25033 5.83203C5.25033 5.50987 4.98916 5.2487 4.66699 5.2487C4.34483 5.2487 4.08366 5.50987 4.08366 5.83203C4.08366 6.15421 4.34483 6.41536 4.66699 6.41536ZM4.66699 7.58203C3.7005 7.58203 2.91699 6.79856 2.91699 5.83203C2.91699 4.86554 3.7005 4.08203 4.66699 4.08203C5.63349 4.08203 6.41699 4.86554 6.41699 5.83203C6.41699 6.79856 5.63349 7.58203 4.66699 7.58203Z" fill="#1B2B40" />
                                </svg>


                                <p className="">

                                    {admittedPatient?.bed_info
                                        ? `Bed ${admittedPatient.bed_info.bed_number}`
                                        : "NIL"}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 pt-1 pb-3 border-b">
                                <svg width="15" height="15" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4.08366 1.7487V0.582031H5.25033V1.7487H8.75033V0.582031H9.91699V1.7487H12.2503C12.5725 1.7487 12.8337 2.00987 12.8337 2.33203V5.2487H11.667V2.91536H9.91699V4.08203H8.75033V2.91536H5.25033V4.08203H4.08366V2.91536H2.33366V11.082H5.83366V12.2487H1.75033C1.42816 12.2487 1.16699 11.9875 1.16699 11.6654V2.33203C1.16699 2.00987 1.42816 1.7487 1.75033 1.7487H4.08366ZM9.91699 6.9987C8.62835 6.9987 7.58366 8.04339 7.58366 9.33203C7.58366 10.6207 8.62835 11.6654 9.91699 11.6654C11.2056 11.6654 12.2503 10.6207 12.2503 9.33203C12.2503 8.04339 11.2056 6.9987 9.91699 6.9987ZM6.41699 9.33203C6.41699 7.39904 7.984 5.83203 9.91699 5.83203C11.85 5.83203 13.417 7.39904 13.417 9.33203C13.417 11.265 11.85 12.832 9.91699 12.832C7.984 12.832 6.41699 11.265 6.41699 9.33203ZM9.33366 7.58203V9.57365L10.6712 10.9112L11.4961 10.0862L10.5003 9.09041V7.58203H9.33366Z" fill="#1B2B40" />
                                </svg>


                                <p className="">{formatFullDateTime(admittedPatient.request_date)}</p>
                            </div>
                            <button className="text-center mt-3 py-2 border border-[#1B2B40] w-full rounded-full cursor-pointer">
                                View patient's details
                            </button>
                        </div>
                    ))
                }
            </div>

            <Pagination count={count}
                currentPage={currentPage}
                totalPages={totalPages}
                fetchData={fetchAdmittedPatients}
                tab={tab} />
        </>

    )
}

const getTabs = (advanceCheckUp, setAdvanceCheckUp, setSelected) => [
    { 
      title: "Admitted Patients", 
      status: "active", 
      content: <AdmittedPatientsTab   advanceCheckUp={advanceCheckUp} 
      setAdvanceCheckUp={setAdvanceCheckUp} setSelected = {setSelected} /> 
    },
  
    { 
      title: "Discharged Patients", 
      status: "discharged", 
      content: <DischargedPatientsTab   advanceCheckUp={advanceCheckUp} 
      setAdvanceCheckUp={setAdvanceCheckUp} setSelected ={setSelected}/> 
    },
  ];
  
  export default getTabs;