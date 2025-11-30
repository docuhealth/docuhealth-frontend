import React, { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from '../../../../../../utils/axiosInstance'
import Pagination from "../../../../Patient_Dashboard_Components/Pagination/Pagination";
import formatRecordDate from "../../../../Patient_Dashboard_Components/Home Dashboard/Components/formatRecordDate";
import { formatFullDateTime } from "../../../../Patient_Dashboard_Components/Home Dashboard/Components/formatRecordDate";
import { truncateWords } from "../../../../Patient_Dashboard_Components/Home Dashboard/Components/formatRecordDate";

const PatientInfo = ({ patientFullInfo }) => {
    console.log(patientFullInfo)
    return (
        <>
            <div className="my-5 bg-[#FAFAFA] rounded-xl border p-4">
                <h2 className="font-medium">General Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1 ">First Name</p>
                        <input
                            type="text"
                            readOnly
                            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                            value={patientFullInfo?.patient_info?.firstname}
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1 ">Last Name</p>
                        <input
                            type="text"
                            readOnly
                            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                            value={patientFullInfo?.patient_info?.lastname}
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1 ">Date of birth</p>
                        <input
                            type="text"
                            readOnly
                            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                            value={patientFullInfo?.patient_info?.dob}
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1 ">Email address</p>
                        <input
                            type="text"
                            readOnly
                            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                            value={patientFullInfo?.patient_info?.email || 'NIL'}
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1 ">Phone number</p>
                        <input
                            type="text"
                            readOnly
                            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                            value={patientFullInfo?.patient_info?.phone_num}
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1 ">Home address</p>
                        <input
                            type="text"
                            readOnly
                            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                            value={patientFullInfo?.patient_info?.street + patientFullInfo?.patient_info?.city + patientFullInfo?.patient_info?.state + patientFullInfo?.patient_info?.country || 'NIL'}
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1 ">Assigned doctor</p>
                        <input
                            type="text"
                            readOnly
                            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                            value="NIL"
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1 ">Date of last visit</p>
                        <input
                            type="text"
                            readOnly
                            className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
                            value="NIL"
                        />
                    </div>

                </div>
            </div>
            <div className="my-5 bg-[#FAFAFA] rounded-xl border p-4">
                <h2 className="font-medium">Latest vital signs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[12px] mt-5">
                    <div className=" bg-white border rounded-md p-3">
                        <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M13.1874 2.81468C13.7081 3.33538 13.7081 4.1796 13.1874 4.7003L11.3018 6.58591L9.41615 4.7003L11.3018 2.81468C11.8225 2.29398 12.6667 2.29398 13.1874 2.81468ZM14.1302 1.87187C13.0888 0.83047 11.4004 0.83047 10.359 1.87187L8.47335 3.75748L8.23762 3.52201C7.97728 3.26166 7.55522 3.26166 7.29482 3.52201C7.03448 3.78236 7.03448 4.20446 7.29482 4.46482L7.53055 4.70054L3.38742 8.84364C3.01516 9.21591 2.76141 9.69004 2.65816 10.2063L2.42427 11.3758C2.37265 11.6338 2.24578 11.8709 2.05964 12.057L1.40229 12.7144C1.14194 12.9748 1.14194 13.3969 1.40229 13.6572L2.3451 14.6C2.60545 14.8604 3.02756 14.8604 3.28791 14.6L3.94526 13.9427C4.13139 13.7566 4.36846 13.6297 4.62658 13.578L5.79602 13.3442C6.31226 13.2409 6.78642 12.9872 7.15868 12.6149L11.3018 8.47178L11.5375 8.70744C11.7978 8.96778 12.22 8.96778 12.4803 8.70744C12.7406 8.44711 12.7406 8.02498 12.4803 7.76464L12.2446 7.52898L14.1302 5.6431C15.1716 4.6017 15.1716 2.91326 14.1302 1.87187ZM8.47335 5.64335L10.359 7.52898L6.21585 11.6721C6.02972 11.8582 5.79265 11.9851 5.53453 12.0367L4.36509 12.2706C3.84885 12.3738 3.37472 12.6276 3.00245 12.9999C3.37472 12.6276 3.62846 12.1535 3.73171 11.6372L3.9656 10.4678C4.01722 10.2097 4.1441 9.97264 4.33023 9.78651L8.47335 5.64335Z"
                                    fill="#3E4095"
                                />
                            </svg>
                            Blood Pressure
                        </p>
                        <p className="font-medium">
                            {patientFullInfo?.latest_vitals?.blood_pressure}
                        </p>
                    </div>
                    <div className=" bg-white border rounded-md p-3">
                        <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M5.33203 3.33317C5.33203 1.86041 6.52594 0.666504 7.9987 0.666504C9.47143 0.666504 10.6654 1.86041 10.6654 3.33317V6.8363C11.8744 7.67957 12.6654 9.0807 12.6654 10.6665C12.6654 13.2438 10.576 15.3332 7.9987 15.3332C5.42137 15.3332 3.33203 13.2438 3.33203 10.6665C3.33203 9.0807 4.12304 7.67957 5.33203 6.8363V3.33317ZM6.09483 7.9299C5.20498 8.55057 4.66536 9.56197 4.66536 10.6665C4.66536 12.5074 6.15775 13.9998 7.9987 13.9998C9.83963 13.9998 11.332 12.5074 11.332 10.6665C11.332 9.56197 10.7924 8.55057 9.90256 7.9299L9.33203 7.5319V3.33317C9.33203 2.59679 8.7351 1.99984 7.9987 1.99984C7.2623 1.99984 6.66536 2.59679 6.66536 3.33317V7.5319L6.09483 7.9299ZM5.33203 10.6665H10.6654C10.6654 12.1392 9.47143 13.3332 7.9987 13.3332C6.52594 13.3332 5.33203 12.1392 5.33203 10.6665Z"
                                    fill="#3E4095"
                                />
                            </svg>
                            Temperature
                        </p>
                        <p className="font-medium">
                            {patientFullInfo?.latest_vitals?.temp} °F
                        </p>
                    </div>
                    <div className=" bg-white border rounded-md p-3">
                        <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M11.0013 2C13.0264 2 14.668 3.66667 14.668 6C14.668 10.6667 9.66797 13.3333 8.0013 14.3333C6.68304 13.5423 3.2793 11.7087 1.91393 8.66733L0.667969 8.66667V7.33333L1.47494 7.33393C1.38414 6.90887 1.33464 6.46434 1.33464 6C1.33464 3.66667 3.0013 2 5.0013 2C6.24128 2 7.33464 2.66667 8.0013 3.33333C8.66797 2.66667 9.7613 2 11.0013 2ZM11.0013 3.33333C10.284 3.33333 9.5075 3.71274 8.9441 4.27614L8.0013 5.21895L7.0585 4.27614C6.49509 3.71274 5.71857 3.33333 5.0013 3.33333C3.70734 3.33333 2.66797 4.43767 2.66797 6C2.66797 6.45695 2.7282 6.90107 2.84569 7.3336L4.29051 7.33333L5.66797 5.03757L7.66797 8.37087L8.2905 7.33333H11.3346V8.66667H9.04544L7.66797 10.9625L5.66797 7.62913L5.04543 8.66667L3.40656 8.66707C3.93282 9.58247 4.73 10.4454 5.76473 11.2686C6.26131 11.6637 6.79097 12.0323 7.3787 12.4025C7.5777 12.5279 7.77537 12.6486 8.0013 12.7835C8.22724 12.6486 8.4249 12.5279 8.6239 12.4025C9.21164 12.0323 9.7413 11.6637 10.2379 11.2686C12.2238 9.68867 13.3346 7.96233 13.3346 6C13.3346 4.42717 12.31 3.33333 11.0013 3.33333Z"
                                    fill="#3E4095"
                                />
                            </svg>
                            Weight
                        </p>
                        <p className="font-medium">
                            {patientFullInfo?.latest_vitals?.weight} Kg
                        </p>
                    </div>
                    <div className=" bg-white border rounded-md p-3">
                        <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M13.4938 3.17157C15.0022 4.68315 15.054 7.09133 13.6511 8.662L7.99863 14.3233L2.34628 8.662C0.943397 7.09133 0.995837 4.67934 2.5036 3.17157C4.01308 1.6621 6.42882 1.61125 7.99936 3.01902C9.56536 1.61333 11.9854 1.66 13.4938 3.17157ZM3.44641 4.11438C2.45325 5.10754 2.40339 6.6982 3.31865 7.7488L7.99863 12.4362L12.6788 7.7488C13.5944 6.6978 13.5447 5.11017 12.55 4.1134C11.5585 3.11986 9.96256 3.07204 8.9149 3.98917L6.11308 6.79127L5.17027 5.84843L7.05336 3.964L6.99883 3.91801C5.949 3.07465 4.41418 3.14662 3.44641 4.11438Z"
                                    fill="#3E4095"
                                />
                            </svg>
                            Respiratory rate
                        </p>
                        <p className="font-medium">
                            {patientFullInfo?.latest_vitals?.resp_rate} / min
                        </p>
                    </div>
                    <div className=" bg-white border rounded-md p-3">
                        <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M11.0013 2C13.0264 2 14.668 3.66667 14.668 6C14.668 10.6667 9.66797 13.3333 8.0013 14.3333C6.68304 13.5423 3.2793 11.7087 1.91393 8.66733L0.667969 8.66667V7.33333L1.47494 7.33393C1.38414 6.90887 1.33464 6.46434 1.33464 6C1.33464 3.66667 3.0013 2 5.0013 2C6.24128 2 7.33464 2.66667 8.0013 3.33333C8.66797 2.66667 9.7613 2 11.0013 2ZM11.0013 3.33333C10.284 3.33333 9.5075 3.71274 8.9441 4.27614L8.0013 5.21895L7.0585 4.27614C6.49509 3.71274 5.71857 3.33333 5.0013 3.33333C3.70734 3.33333 2.66797 4.43767 2.66797 6C2.66797 6.45695 2.7282 6.90107 2.84569 7.3336L4.29051 7.33333L5.66797 5.03757L7.66797 8.37087L8.2905 7.33333H11.3346V8.66667H9.04544L7.66797 10.9625L5.66797 7.62913L5.04543 8.66667L3.40656 8.66707C3.93282 9.58247 4.73 10.4454 5.76473 11.2686C6.26131 11.6637 6.79097 12.0323 7.3787 12.4025C7.5777 12.5279 7.77537 12.6486 8.0013 12.7835C8.22724 12.6486 8.4249 12.5279 8.6239 12.4025C9.21164 12.0323 9.7413 11.6637 10.2379 11.2686C12.2238 9.68867 13.3346 7.96233 13.3346 6C13.3346 4.42717 12.31 3.33333 11.0013 3.33333Z"
                                    fill="#3E4095"
                                />
                            </svg>
                            Heart rate
                        </p>
                        <p className="font-medium">
                            {patientFullInfo?.latest_vitals?.heart_rate} bpm
                        </p>
                    </div>
                    <div className=" bg-white border rounded-md p-3">
                        <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M11.3333 12.6667H12.6667V9.33333H6.66667V3.33333H3.33333V4.66667H4.66667V6H3.33333V7.33333H5.33333V8.66667H3.33333V10H4.66667V11.3333H3.33333V12.6667H4.66667V11.3333H6V12.6667H7.33333V10.6667H8.66667V12.6667H10V11.3333H11.3333V12.6667ZM8 8H13.3333C13.7015 8 14 8.29847 14 8.66667V13.3333C14 13.7015 13.7015 14 13.3333 14H2.66667C2.29848 14 2 13.7015 2 13.3333V2.66667C2 2.29848 2.29848 2 2.66667 2H7.33333C7.70153 2 8 2.29848 8 2.66667V8Z"
                                    fill="#3E4095"
                                />
                            </svg>
                            Height
                        </p>
                        <p className="font-medium">
                            {patientFullInfo?.latest_vitals?.height} m
                        </p>
                    </div>

                </div>
            </div>
            <div className="my-5 bg-[#FAFAFA] rounded-xl border p-4">
                <h2 className="font-medium">Ongoing Medication ({patientFullInfo?.ongoing_drugs?.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[12px] mt-5">
                    {patientFullInfo?.ongoing_drugs?.map((drug, index) => (
                        <div key={index} className="border p-4 rounded-md bg-white">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.1861 2.81611C14.7481 4.3782 14.7481 6.91088 13.1861 8.47295L11.7713 9.88668L8.47199 13.187C6.90986 14.7491 4.37722 14.7491 2.81512 13.187C1.25303 11.6249 1.25303 9.09228 2.81512 7.53015L7.52919 2.81611C9.09126 1.25401 11.6239 1.25401 13.1861 2.81611ZM9.88619 9.88715L6.11496 6.11593L3.75794 8.47295C2.71654 9.51435 2.71654 11.2028 3.75794 12.2442C4.79933 13.2856 6.48777 13.2856 7.52919 12.2442L9.88619 9.88715Z" fill="#EE1414" />
                                    </svg>
                                    <p className="font-medium">{drug.name}</p>
                                </div>


                                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[12px]">
                                    Ongoing
                                </span>
                            </div>

                            <div className="flex justify-between mt-2">
                                <p>Dosage:</p>
                                <p className="text-right font-medium">
                                    {drug.quantity ? `${drug.quantity} mg` : "NIL"}
                                </p>
                            </div>

                            <div className="flex justify-between mt-2">
                                <p>Frequency:</p>
                                <p className="text-right font-medium">
                                    {drug.frequency
                                        ? `${drug.frequency.value}× ${drug.frequency.rate}`
                                        : "NIL"}
                                </p>
                            </div>

                            <div className="flex justify-between mt-2">
                                <p>Duration:</p>
                                <p className="text-right font-medium">
                                    {drug.duration
                                        ? `${drug.duration.value} ${drug.duration.rate}`
                                        : "NIL"}
                                </p>
                            </div>

                            <div className="flex justify-between mt-2">
                                <p>Prescribed by:</p>
                                <p className="text-right font-medium">
                                    {patientFullInfo?.latest_vitals?.staff_info
                                        ? `Dr. ${patientFullInfo.latest_vitals.staff_info.firstname} ${patientFullInfo.latest_vitals.staff_info.lastname}`
                                        : "NIL"}
                                </p>
                            </div>
                        </div>

                    ))
                    }
                </div>
            </div>

        </>
    )
}

const PatientMedicalRecord = ({ patientMedRecords, count, currentPage, totalPages, fetchPatientMedRecords, setSelectedMedicalRecord, setViewDetailMedicalRecord, loading, medloading }) => {



    if (medloading) {
        return (
            <div className="flex justify-center items-center h-full text-sm pt-10">
                Loading...
            </div>
        );
    }

    if (patientMedRecords.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center text-center  h-full">
                <svg
                    width="200"
                    height="200"
                    viewBox="0 0 366 366"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g filter="url(#filter0_d_1501_46523)">
                        <circle cx="183" cy="171" r="159" fill="#DBDBDB" />
                    </g>
                    <circle cx="183" cy="171" r="132" fill="#F6F6F6" />
                    <path
                        d="M183 233.5C148.482 233.5 120.5 205.518 120.5 171C120.5 136.482 148.482 108.5 183 108.5C217.518 108.5 245.5 136.482 245.5 171C245.5 205.518 217.518 233.5 183 233.5ZM183 221C210.614 221 233 198.614 233 171C233 143.386 210.614 121 183 121C155.386 121 133 143.386 133 171C133 198.614 155.386 221 183 221ZM176.75 139.75H189.25V152.25H176.75V139.75ZM176.75 164.75H189.25V202.25H176.75V164.75Z"
                        fill="#929AA3"
                    />
                    <defs>
                        <filter
                            id="filter0_d_1501_46523"
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
                                result="effect1_dropShadow_1501_46523"
                            />
                            <feBlend
                                mode="normal"
                                in="SourceGraphic"
                                in2="effect1_dropShadow_1501_46523"
                                result="shape"
                            />
                        </filter>
                    </defs>
                </svg>

                <h2 className="font-medium pb-1">No medical records!</h2>
                <div className="max-w-md text-center">
                    <p className="text-[12px] text-gray-500">
                        {" "}
                        This patient does not have any medical records
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {Array.isArray(patientMedRecords) && patientMedRecords.length > 0 ? (
                <>
                    <div className="my-4 text-[12px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {patientMedRecords.map((record) => (
                            <div key={record.id} className="bg-[#FAFEFF] border rounded-xl p-5">
                                <div className="flex justify-between items-center ">
                                    <div className="flex items-center gap-1">
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
                                        <p className="font-medium">
                                            {" "}
                                            {record?.doctor_info
                                                ? `${record.doctor_info.firstname} ${record.doctor_info.lastname}`
                                                : "NIL"}
                                        </p>
                                    </div>
                                    <div className="bg-[#D2F5DB] px-2 rounded-full">
                                        <p className="text-[#08A913] ">
                                            {formatRecordDate(record.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 py-1">
                                    <div>
                                        <svg
                                            width="15"
                                            height="15"
                                            viewBox="0 0 15 15"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M5.16536 2.25V3.41667H3.9987V5.75C3.9987 7.03864 5.04337 8.08333 6.33203 8.08333C7.62067 8.08333 8.66536 7.03864 8.66536 5.75V3.41667H7.4987V2.25H9.2487C9.57087 2.25 9.83203 2.51117 9.83203 2.83333V5.75C9.83203 7.48408 8.57092 8.92362 6.91583 9.20152L6.91536 10.125C6.91536 11.2526 7.82945 12.1667 8.95703 12.1667C9.83046 12.1667 10.5758 11.6182 10.8674 10.8469C10.2569 10.5742 9.83203 9.96172 9.83203 9.25C9.83203 8.28347 10.6155 7.5 11.582 7.5C12.5486 7.5 13.332 8.28347 13.332 9.25C13.332 10.0498 12.7955 10.7243 12.0627 10.9332C11.7046 12.3137 10.4499 13.3333 8.95703 13.3333C7.1851 13.3333 5.7487 11.8969 5.7487 10.125L5.74881 9.20164C4.09342 8.92397 2.83203 7.48431 2.83203 5.75V2.83333C2.83203 2.51117 3.0932 2.25 3.41536 2.25H5.16536ZM11.582 8.66667C11.2599 8.66667 10.9987 8.92782 10.9987 9.25C10.9987 9.57217 11.2599 9.83333 11.582 9.83333C11.9042 9.83333 12.1654 9.57217 12.1654 9.25C12.1654 8.92782 11.9042 8.66667 11.582 8.66667Z"
                                                fill="#1B2B40"
                                            />
                                        </svg>
                                    </div>
                                    <p className="">Medical Doctor</p>
                                </div>
                                <div className="flex items-center gap-1 pb-1">
                                    <div>
                                        <svg
                                            width="15"
                                            height="15"
                                            viewBox="0 0 15 15"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M5.16536 12.1665V8.6665H9.83203V12.1665H11.582V2.83317H3.41536V12.1665H5.16536ZM6.33203 12.1665H8.66536V9.83317H6.33203V12.1665ZM12.7487 12.1665H13.9154V13.3332H1.08203V12.1665H2.2487V2.24984C2.2487 1.92767 2.50987 1.6665 2.83203 1.6665H12.1654C12.4875 1.6665 12.7487 1.92767 12.7487 2.24984V12.1665ZM6.91536 5.1665V3.99984H8.08203V5.1665H9.2487V6.33317H8.08203V7.49984H6.91536V6.33317H5.7487V5.1665H6.91536Z"
                                                fill="#1B2B40"
                                            />
                                        </svg>
                                    </div>
                                    <p className=""> {record?.hospital_info
                                        ? `${record.hospital_info.name}`
                                        : "NIL"}</p>
                                </div>
                                <div className="flex items-center gap-1 pb-3 border-b ">
                                    <div>
                                        <svg
                                            width="15"
                                            height="15"
                                            viewBox="0 0 15 15"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M4.58464 2.25016V1.0835H5.7513V2.25016H9.2513V1.0835H10.418V2.25016H12.7513C13.0735 2.25016 13.3346 2.51133 13.3346 2.8335V5.75016H12.168V3.41683H10.418V4.5835H9.2513V3.41683H5.7513V4.5835H4.58464V3.41683H2.83464V11.5835H6.33464V12.7502H2.2513C1.92914 12.7502 1.66797 12.489 1.66797 12.1668V2.8335C1.66797 2.51133 1.92914 2.25016 2.2513 2.25016H4.58464ZM10.418 7.50016C9.12933 7.50016 8.08464 8.54485 8.08464 9.8335C8.08464 11.1221 9.12933 12.1668 10.418 12.1668C11.7066 12.1668 12.7513 11.1221 12.7513 9.8335C12.7513 8.54485 11.7066 7.50016 10.418 7.50016ZM6.91797 9.8335C6.91797 7.9005 8.48498 6.3335 10.418 6.3335C12.351 6.3335 13.918 7.9005 13.918 9.8335C13.918 11.7665 12.351 13.3335 10.418 13.3335C8.48498 13.3335 6.91797 11.7665 6.91797 9.8335ZM9.83463 8.0835V10.0751L11.1722 11.4126L11.9971 10.5877L11.0013 9.59188V8.0835H9.83463Z"
                                                fill="#1B2B40"
                                            />
                                        </svg>
                                    </div>
                                    <p className="">{formatFullDateTime(record.created_at)}</p>
                                </div>
                                <div className="py-5">
                                    <p>{truncateWords(record.chief_complaint, 20)}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 ">
                                    <button
                                        className="bg-[#1B2B40] py-2 text-white rounded-full cursor-pointer"
                                        onClick={() => {
                                            setSelectedMedicalRecord(record); // ✅ single record
                                            setViewDetailMedicalRecord(true);
                                            console.log("Selected Medical Record:", record); // logs the record immediately
                                        }}
                                    >
                                        <p>View details</p>
                                    </button>
                                    <button className="flex justify-center items-center gap-1 py-2 border border-[#1B2B40] rounded-full cursor-pointer">


                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6.5 5H9L6 8L3 5H5.5V1.5H6.5V5ZM2 9.5H10V6H11V10C11 10.2761 10.7761 10.5 10.5 10.5H1.5C1.22386 10.5 1 10.2761 1 10V6H2V9.5Z" fill="#1B2B40" />
                                        </svg>


                                        <p>Download</p>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination
                        count={count}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        fetchData={fetchPatientMedRecords}
                    />
                </>
            ) : (
                <p className="text-center">No medical records found.</p>
            )}
        </>
    )
}




const getTabs = (   patientMedRecords,
    patientFullInfo,
    count,
    currentPage,
    totalPages,
    fetchPatientMedRecords,
    setSelectedMedicalRecord,     // first
    setViewDetailMedicalRecord,   // second
    loading,
    medloading
) => [
    {
        title: "Patient's Information",
        content: <PatientInfo
            patientFullInfo={patientFullInfo}
        />
    },
    {
        title: "Patient's Medical Record",
        content: <PatientMedicalRecord
            loading={loading}
            medloading = {medloading}
            patientMedRecords={patientMedRecords}
            count={count} currentPage={currentPage} totalPages={totalPages} fetchPatientMedRecords={fetchPatientMedRecords}
            setSelectedMedicalRecord={setSelectedMedicalRecord}
            setViewDetailMedicalRecord={setViewDetailMedicalRecord}
        />
    }
]

export default getTabs