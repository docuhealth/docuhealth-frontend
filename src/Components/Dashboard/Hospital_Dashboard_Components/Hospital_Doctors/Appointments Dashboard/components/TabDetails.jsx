import React, { useState } from "react";
import Pagination2 from "../../../../Patient_Dashboard_Components/Pagination/Pagination2";
import formatRecordDate from "../../../../Patient_Dashboard_Components/Home Dashboard/Components/formatRecordDate";
import {
  formatFullDateTime,
  getAge,
} from "../../../../Patient_Dashboard_Components/Home Dashboard/Components/formatRecordDate";
import { truncateWords } from "../../../../Patient_Dashboard_Components/Home Dashboard/Components/formatRecordDate";
import {
  CalendarIcon,
  User,
  UserIcon,
  Image,
  FileText,
  Eye,
  ArrowDownToLine,
} from "lucide-react";
import {
  formatFullDate,
  formatTime,
} from "../../../../Patient_Dashboard_Components/Patient_Appointments_Dashboard/Components/Date_Time_Formatter";
import toast from "react-hot-toast";

const PatientInfo = ({ patientFullInfo }) => {
  console.log(patientFullInfo);
  return (
    <>
      <div className="my-5 bg-[#FAFAFA] rounded-lg border p-4">
        <h2 className="font-medium">General Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1 ">
              First Name
            </p>
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
            <p className="text-sm font-medium text-gray-500 mb-1 ">
              Date of birth
            </p>
            <input
              type="text"
              readOnly
              className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
              value={patientFullInfo?.patient_info?.dob}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 mb-1 ">
              Email address
            </p>
            <input
              type="text"
              readOnly
              className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
              value={patientFullInfo?.patient_info?.email || "NIL"}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 mb-1 ">
              Phone number
            </p>
            <input
              type="text"
              readOnly
              className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
              value={patientFullInfo?.patient_info?.phone_num}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 mb-1 ">
              Home address
            </p>
            <input
              type="text"
              readOnly
              className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
              value={
                patientFullInfo?.patient_info?.street +
                ", " +
                patientFullInfo?.patient_info?.city +
                ", " +
                patientFullInfo?.patient_info?.state +
                ", " +
                patientFullInfo?.patient_info?.country || "NIL"
              }
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 mb-1 ">
              Assigned doctor
            </p>
            <input
              type="text"
              readOnly
              className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
              value="NIL"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 mb-1 ">
              Date of last visit
            </p>
            <input
              type="text"
              readOnly
              className="w-full py-2 text-gray-500 rounded-lg text-sm bg-white border px-3"
              value="NIL"
            />
          </div>
        </div>
      </div>
      <div className="my-5 bg-[#FAFAFA] rounded-lg border p-4">
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
              {patientFullInfo?.latest_vitals?.blood_pressure} mmHG
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
      <div className="my-5 bg-[#FAFAFA] rounded-lg border p-4">
        <h2 className="font-medium">
          Ongoing Medication ({patientFullInfo?.ongoing_drugs?.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[12px] mt-5">
          {patientFullInfo?.ongoing_drugs?.map((drug, index) => (
            <div key={index} className="border p-4 rounded-md bg-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.1861 2.81611C14.7481 4.3782 14.7481 6.91088 13.1861 8.47295L11.7713 9.88668L8.47199 13.187C6.90986 14.7491 4.37722 14.7491 2.81512 13.187C1.25303 11.6249 1.25303 9.09228 2.81512 7.53015L7.52919 2.81611C9.09126 1.25401 11.6239 1.25401 13.1861 2.81611ZM9.88619 9.88715L6.11496 6.11593L3.75794 8.47295C2.71654 9.51435 2.71654 11.2028 3.75794 12.2442C4.79933 13.2856 6.48777 13.2856 7.52919 12.2442L9.88619 9.88715Z"
                      fill="#EE1414"
                    />
                  </svg>
                  <p className="font-medium">{drug.name}</p>
                </div>

                <span className="bg-blue-100/50 text-[#3E4095] px-3 py-1 rounded-full text-[12px]">
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
          ))}
        </div>
      </div>
    </>
  );
};

const PatientMedicalRecord = ({
  patientMedRecords,
  count,
  currentPage,
  totalPages,
  setCurrentPage,
  setSelectedMedicalRecord,
  setViewDetailMedicalRecord,
  medloading,
}) => {
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
      {/* {Array.isArray(patientMedRecords) && patientMedRecords.length > 0 ? (
        <>
          <div className="my-4 text-[12px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {patientMedRecords.map((record) => (
              <div
                key={record.id}
                className="bg-[#FAFEFF] border rounded-xl p-5"
              >
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
                  <p className="">
                    {" "}
                    {record?.hospital_info
                      ? `${record.hospital_info.name}`
                      : "NIL"}
                  </p>
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
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.5 5H9L6 8L3 5H5.5V1.5H6.5V5ZM2 9.5H10V6H11V10C11 10.2761 10.7761 10.5 10.5 10.5H1.5C1.22386 10.5 1 10.2761 1 10V6H2V9.5Z"
                        fill="#1B2B40"
                      />
                    </svg>

                    <p>Download</p>
                  </button>
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
        </>
      ) : (
        <p className="text-center">No medical records found.</p>
      )} */}
      <p className="text-center text-sm">Coming Soon !!!</p>
    </>
  );
};

const PatientSOAPNotes = ({
  soapNotesLoading,
  patientSoapNotes,
  soapCount,
  soapCurrentPage,
  soapTotalPages,
  setSoapCurrentPage
}) => {
  console.log(patientSoapNotes);

  if (soapNotesLoading) {
    return (
      <div className="flex justify-center items-center h-full text-sm pt-10">
        Loading...
      </div>
    );
  }

  if (patientSoapNotes.length === 0) {
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

        <h2 className="font-medium pb-1">No soap notes!</h2>
        <div className="max-w-md text-center">
          <p className="text-[12px] text-gray-500">
            {" "}
            This patient does not have any soap notes
          </p>
        </div>
      </div>
    );
  }

  const [seePatientDetails, setSeePatientDetails] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);

  const [createAdditionalNotes, setCreateAdditionalNotes] = useState(false);
  const [noteDescription, setNoteDescription] = useState("");

  const [openPopover, setOpenPopover] = useState(null);
  const togglePopover = (index) => {
    setOpenPopover(openPopover === index ? null : index);
  };

  console.log(selectedPatientDetails);

  return (
    <div>
      {seePatientDetails ? (
        <div className="text-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 sm:gap-0  border-b pb-4 w-full">
            <div
              className="flex justify-start items-center gap-1 cursor-pointer"
              onClick={() => setSeePatientDetails(false)}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.56528 6.41685H11.6654V7.58352H4.56528L7.69426 10.7125L6.86932 11.5374L2.33203 7.00019L6.86932 2.46289L7.69426 3.28785L4.56528 6.41685Z"
                  fill="#1B2B40"
                />
              </svg>

              <h2 className=" text-sm">SOAP Note Overview</h2>
            </div>
            <div className=" flex flex-col sm:flex-row justify-end items-center gap-3 w-full sm:w-auto">
              <div className="flex justify-center items-center gap-1 border border-[#3E4095] py-1.5 px-4 rounded-full w-full sm:w-auto text-[#3E4095] cursor-pointer" onClick={() => setCreateAdditionalNotes(true)}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                    stroke="#3E4095"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M14 2V8H20"
                    stroke="#3E4095"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12 18V12"
                    stroke="#3E4095"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M9 15H15"
                    stroke="#3E4095"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>

                <p>Create additional notes</p>
              </div>
            </div>
          </div>
          <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
            <p className="text-[12px] mb-4">
              {" "}
              Patient's name :{" "}
              <span className="font-medium text-sm">
                {" "}
                {selectedPatientDetails?.patient_info?.firstname}{" "}
                {selectedPatientDetails?.patient_info?.lastname}
              </span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="">
                <p className="text-[12px]">
                  {" "}
                  Patient's HIN :{" "}
                  <span className="font-medium ">
                    {" "}
                    {selectedPatientDetails?.patient_info?.hin ||
                      selectedPatientDetails?.subaccount}
                  </span>
                </p>
                <p className="text-[12px]">
                  {" "}
                  Patient's Age :{" "}
                  <span className="font-medium ">
                    {" "}
                    {getAge(selectedPatientDetails?.patient_info?.dob) ||
                      "30 years old"}
                  </span>
                </p>
                <p className="text-[12px]">
                  {" "}
                  Patient's Gender :{" "}
                  <span className="font-medium ">
                    {" "}
                    {selectedPatientDetails?.patient_info?.gender || "Male"}
                  </span>
                </p>
              </div>
              <div className="">
                <p className="text-[12px]">
                  {" "}
                  Patient's Doctor :{" "}
                  <span className="font-medium ">
                    {" "}
                    {selectedPatientDetails?.staff_info?.firstname}{" "}
                    {selectedPatientDetails?.staff_info?.lastname}
                  </span>
                </p>
                <p className="text-[12px]">
                  {" "}
                  Specialisation :{" "}
                  <span className="font-medium">
                    {" "}
                    {selectedPatientDetails?.staff_info?.specialization ||
                      "surgeon"}
                  </span>
                </p>
              </div>
              <div className="">
                <p className="text-[12px]">
                  {" "}
                  Hospital :{" "}
                  <span className="font-medium ">
                    {" "}
                    {selectedPatientDetails?.hospital_info?.name ||
                      "Test Clinic"}
                  </span>
                </p>
                <p className="text-[12px]">
                  {" "}
                  Hospital's Email :{" "}
                  <span className="font-medium ">
                    {" "}
                    {selectedPatientDetails?.hospital_info?.email ||
                      "TestClinic@gmail.com"}
                  </span>
                </p>
              </div>
              <div className="">
                <p className="text-[12px]">
                  {" "}
                  Status :{" "}
                  <span className="font-medium ">
                    {" "}
                    {formatRecordDate(selectedPatientDetails.created_at)}
                  </span>
                </p>
                <p className="text-[12px]">
                  {" "}
                  Date / Time Uploaded :{" "}
                  <span className="font-medium ">
                    {" "}
                    {formatFullDateTime(selectedPatientDetails.created_at)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Vital Signs*/}
          <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
            <p className="font-medium mb-4"> Vital Signs</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[12px]">
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
                  {selectedPatientDetails?.vital_signs_info?.blood_pressure}{" "}
                  mmHg
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
                  {selectedPatientDetails?.vital_signs_info?.temp} °F
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
                  {selectedPatientDetails?.vital_signs_info?.weight} Kg
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
                  {selectedPatientDetails?.vital_signs_info?.resp_rate} / min
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
                  {selectedPatientDetails?.vital_signs_info?.heart_rate} bpm
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
                  {selectedPatientDetails?.vital_signs_info?.height} m
                </p>
              </div>
            </div>
          </div>

          {/* 1. Extended Clinical History */}
          <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
            <p className="font-medium mb-4 text-[#1B2B40]">
              Clinical History Details
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-[12px] pb-2">
                <h4 className="text-gray-400 font-normal mb-1">
                  History of Complaint:
                </h4>
                <p className="font-medium">
                  {selectedPatientDetails?.history_of_complain || "NIL"}
                </p>
              </div>

              <div className="text-[12px] pb-2">
                <h4 className="text-gray-400 font-normal mb-1">
                  Past Medical History:
                </h4>
                <p className="font-medium">
                  {selectedPatientDetails?.past_med_history || "NIL"}
                </p>
              </div>

              <div className="text-[12px] pb-2">
                <h4 className="text-gray-400 font-normal mb-1">
                  Family History:
                </h4>
                <p className="font-medium">
                  {selectedPatientDetails?.family_history || "NIL"}
                </p>
              </div>

              <div className="text-[12px] pb-2">
                <h4 className="text-gray-400 font-normal mb-1">
                  Social History:
                </h4>
                <p className="font-medium">
                  {selectedPatientDetails?.social_history || "NIL"}
                </p>
              </div>
            </div>

            <div className="text-[12px] pt-2 border-t mt-2">
              <h4 className="text-gray-400 font-normal mb-1">
                Other Relevant History:
              </h4>
              <p className="font-medium">
                {selectedPatientDetails?.other_history || "NIL"}
              </p>
            </div>
          </div>

          {/* 2. Physical Examinations & Review */}
          <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
            <p className="font-medium mb-4">Examination Findings</p>

            <div className="text-[12px] pb-3">
              <h4 className="text-gray-400 font-normal mb-1">
                General Examination:
              </h4>
              <ul className="list-disc list-outside pl-5 font-medium">
                {selectedPatientDetails?.general_exam?.map((item, index) => (
                  <li key={index}>{item}</li>
                )) || <li>NIL</li>}
              </ul>
            </div>

            <div className="text-[12px] pb-3">
              <h4 className="text-gray-400 font-normal mb-1">
                Systemic Examination:
              </h4>
              <ul className="list-disc list-outside pl-5 font-medium">
                {selectedPatientDetails?.systemic_exam?.map((item, index) => (
                  <li key={index}>{item}</li>
                )) || <li>NIL</li>}
              </ul>
            </div>

            <div className="text-[12px]">
              <h4 className="text-gray-400 font-normal mb-1">
                Review of Systems:
              </h4>
              <p className="font-medium">
                {selectedPatientDetails?.review || "NIL"}
              </p>
            </div>
          </div>

          {/* 3. Diagnosis & Testing */}
          <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
            <p className="font-medium mb-4">Diagnosis & Investigations</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="text-[12px]">
                <h4 className="text-gray-400 font-normal mb-1">
                  Primary Diagnosis:
                </h4>
                <p className="font-medium text-[#3E4095]">
                  {selectedPatientDetails?.primary_diagnosis || "NIL"}
                </p>
              </div>
              <div className="text-[12px]">
                <h4 className="text-gray-400 font-normal mb-1">
                  Differential Diagnosis:
                </h4>
                <p className="font-medium">
                  {selectedPatientDetails?.differential_diagnosis || "NIL"}
                </p>
              </div>
            </div>

            <div className="text-[12px] pb-3">
              <h4 className="text-gray-400 font-normal mb-1">
                Investigations Required:
              </h4>
              <ul className="list-disc list-outside pl-5 font-medium">
                {selectedPatientDetails?.investigations?.map((item, index) => (
                  <li key={index}>{item}</li>
                )) || <li>NIL</li>}
              </ul>
            </div>

            <div className="text-[12px]">
              <h4 className="text-gray-400 font-normal mb-1">Bedside Tests:</h4>
              <ul className="list-disc list-outside pl-5 font-medium">
                {selectedPatientDetails?.bedside_tests?.map((item, index) => (
                  <li key={index}>{item}</li>
                )) || <li>NIL</li>}
              </ul>
            </div>
          </div>

          {/* 4. Drug History & Allergies */}
          <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
            <p className="font-medium mb-4">Drug History / Allergies</p>
            <div className="text-[12px]">
              <h4 className="text-gray-400 font-normal mb-1">
                Known Allergies & Sensitivities:
              </h4>
              <p className="font-medium text-red-600 italic">
                {/* Logic to handle the character array in your payload */}
                {Array.isArray(selectedPatientDetails?.drug_history_allergies)
                  ? selectedPatientDetails.drug_history_allergies
                    .join("")
                    .replace(/['\[\]]/g, "")
                  : "NIL"}
              </p>
            </div>
          </div>

          {/* 5. Patient Education & Problems List */}
          <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
            <div className="text-[12px] pb-3">
              <h4 className="text-gray-400 font-normal mb-1">
                Active Problems List:
              </h4>
              <ul className="list-disc list-outside pl-5 font-medium">
                {selectedPatientDetails?.problems_list?.map((item, index) => (
                  <li key={index}>{item}</li>
                )) || <li>NIL</li>}
              </ul>
            </div>

            <div className="text-[12px] pt-3 border-t">
              <h4 className="text-gray-400 font-normal mb-1">
                Patient Education/Counselling:
              </h4>
              <p className="font-medium">
                {selectedPatientDetails?.patient_education || "NIL"}
              </p>
            </div>

            {selectedPatientDetails?.additional_notes?.length > 0 ? (
              <div className="text-[12px] pt-3 mt-3 border-t">
                <h4 className="text-gray-400 font-normal mb-1">
                  Additional Notes:
                </h4>
                <ul className="list-disc list-outside pl-5 font-medium">
                  {selectedPatientDetails.additional_notes.map(
                    (note, index) => (
                      <li key={index}>{note}</li>
                    ),
                  )}
                </ul>
              </div>
            ) : (
              <>
                <p className="text-sm pt-4 font-medium">
                  No additional notes...
                </p>
              </>
            )}
          </div>

          {/* 6. Uploaded Documents / Images */}
          <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
            <p className="font-medium mb-4 text-[#1B2B40]">
              Uploaded Documents / Images
            </p>
            <div>
              {selectedPatientDetails?.investigation_docs?.length > 0 ? (
                selectedPatientDetails.investigation_docs.map(
                  (attachment, index) => {
                    // Correctly mapping your payload fields
                    const fileName =
                      attachment.filename || `Document_${index + 1}`;
                    const fileUrl = attachment.file || attachment.url; // Supporting both common keys
                    const fileSizeMB = attachment.size
                      ? (attachment.size / (1024 * 1024)).toFixed(1) + " MB"
                      : "0.5 MB"; // Fallback placeholder if size is missing
                    const fileDate = formatFullDateTime(
                      selectedPatientDetails.created_at,
                    );

                    const isImage =
                      /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) ||
                      attachment.file_type?.includes("image");
                    const isPdf =
                      /\.pdf$/i.test(fileName) ||
                      attachment.file_type?.includes("pdf");
                    const Icon = isImage ? Image : isPdf ? FileText : FileText;

                    return (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row justify-between items-start gap-5 sm:gap-0 sm:items-center bg-white border rounded-lg px-4 py-3 mb-3 "
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-[12px]">
                          <div className="p-2 bg-[#3E4095]/10 rounded-md">
                            <Icon className="text-[#3E4095]" size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {fileName}
                            </p>
                            <p className="text-gray-500">
                              {fileDate} • {fileSizeMB}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 text-[12px] w-full sm:w-auto">
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 border border-[#3E4095] text-[#3E4095] rounded-full font-medium hover:bg-blue-50 transition py-1 px-3 w-full sm:w-28"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </a>
                          <a
                            href={fileUrl}
                            download
                            className="flex items-center justify-center gap-1 bg-[#3E4095] text-white rounded-full font-medium hover:bg-[#2e3070] transition py-1 px-3 w-full sm:w-28"
                          >
                            <ArrowDownToLine className="w-3 h-3" />
                            Download
                          </a>
                        </div>
                      </div>
                    );
                  },
                )
              ) : (
                <p className="text-[12px] text-gray-500">NIL</p>
              )}
            </div>
          </div>

          {/* 7. Follow Up / Appointment */}
          <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
            <p className="font-medium mb-4 text-[#1B2B40]">
              Follow Up / Appointment
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p className="text-[12px] text-gray-500">
                Type:{" "}
                <span className="font-medium text-gray-900 capitalize">
                  {selectedPatientDetails?.appointment?.type || "NIL"}
                </span>
              </p>
              <p className="text-[12px] text-gray-500">
                Scheduled:{" "}
                <span className="font-medium text-gray-900">
                  {selectedPatientDetails?.appointment?.scheduled_time
                    ? formatFullDateTime(
                      selectedPatientDetails.appointment.scheduled_time,
                    )
                    : "NIL"}
                </span>
              </p>
              {selectedPatientDetails?.appointment?.note && (
                <p className="text-[12px] text-gray-500 col-span-2 mt-1">
                  Note:{" "}
                  <span className="font-medium text-gray-900 italic">
                    "{selectedPatientDetails.appointment.note}"
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* 8. Referral Status */}
          <div className="p-5 my-5 bg-[#FAFAFA] border rounded-lg">
            <p className="font-medium mb-4 text-[#1B2B40]">
              Referral Information
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-[12px] text-gray-500">Referral Status:</p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${selectedPatientDetails?.referred_hosp ||
                    selectedPatientDetails?.referred_docuhealth_hosp
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                    }`}
                >
                  {selectedPatientDetails?.referred_hosp ||
                    selectedPatientDetails?.referred_docuhealth_hosp
                    ? "Active"
                    : "None"}
                </span>
              </div>

              <p className="text-[12px] text-gray-500">
                Referred Hospital:{" "}
                <span className="font-medium text-gray-900">
                  {selectedPatientDetails?.referred_docuhealth_hosp
                    ? `${selectedPatientDetails.referred_docuhealth_hosp} (DocuHealth Provider)`
                    : selectedPatientDetails?.referred_hosp || "NIL"}
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {Array.isArray(patientSoapNotes) && patientSoapNotes.length > 0 ? (
            <>
              <div className="text-[12px] my-4">
                <div className="hidden lg:block">
                  {patientSoapNotes.map((soapNote, index) => (
                    <div
                      key={soapNote.id}
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
                            {formatFullDate(soapNote?.created_at)} /{" "}
                            {formatTime(soapNote?.created_at)}
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
                            {soapNote?.patient_info?.firstname}{" "}
                            {soapNote?.patient_info?.lastname}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-md">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-semibold">
                            Appointed Doctor
                          </p>
                          <p className="text-sm font-medium">
                            Dr. {soapNote?.staff_info?.firstname}{" "}
                            {soapNote?.staff_info?.lastname}
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
                              Chief Complaint
                            </p>
                            <p className="text-sm font-medium truncate max-w-[150px]">
                              {soapNote?.chief_complaint || "NIL"}
                            </p>
                          </div>
                        </div>

                        <div
                          onClick={() => {
                            togglePopover(index);
                            setSelectedPatientDetails(soapNote);
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
                          <div className="absolute top-10 right-0 mt-2 bg-white border shadow-sm rounded-xs p-2 w-52 z-30">
                            <p
                              className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                              onClick={() => {
                                setSeePatientDetails(true);
                                setOpenPopover(null);
                              }}
                            >
                              See full SOAP Note
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="block lg:hidden space-y-4 px-1">
                {patientSoapNotes.map((soapNote, index) => (
                  <div
                    key={soapNote.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">
                          Scheduled
                        </p>
                        <p className="text-sm font-medium">
                          {formatFullDate(soapNote?.created_at)} /{" "}
                          {formatTime(soapNote?.created_at)}
                        </p>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => {
                            togglePopover(index);
                            setSelectedPatientDetails(soapNote);
                          }}
                          className={`h-9 w-9 flex items-center justify-center rounded-full ${openPopover === index ? "bg-slate-200" : "bg-gray-50"}`}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M14 8C14 7.45 13.55 7 13 7C12.45 7 12 7.45 12 8C12 8.55 12.45 9 13 9C13.55 9 14 8.55 14 8ZM4 8C4 7.45 3.55 7 3 7C2.45 7 2 7.45 2 8C2 8.55 2.45 9 3 9C3.55 9 4 8.55 4 8ZM9 8C9 7.45 8.55 7 8 7C7.45 7 7 7.45 7 8C7 8.55 7.45 9 8 9C8.55 9 9 8.55 9 8Z"
                              fill="#1A263E"
                            />
                          </svg>
                        </button>
                        {openPopover === index && (
                          <div className="absolute top-10 right-0 mt-2 bg-white border shadow-sm rounded-xs p-2 w-52 z-30">
                            <p
                              className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                              onClick={() => {
                                setSeePatientDetails(true);
                              }}
                            >
                              See full SOAP Note
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-100">
                          {soapNote?.patient_info?.firstname[0]}
                          {soapNote?.patient_info?.lastname[0]}
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">
                            Patient
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {soapNote?.patient_info?.firstname}{" "}
                            {soapNote?.patient_info?.lastname}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">
                            {soapNote?.staff_info?.role}
                          </p>
                          <p className="text-[13px] text-slate-600">
                            Dr. {soapNote?.staff_info?.firstname}{" "}
                            {soapNote?.staff_info?.lastname}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">
                            Chief Complaint
                          </p>
                          <p className="text-[13px] text-slate-600 truncate italic">
                            " {soapNote?.chief_complaint || "NIL"}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination2
                count={soapCount}
                currentPage={soapCurrentPage}
                totalPages={soapTotalPages}
                setCurrentPage={setSoapCurrentPage}
              />
            </>
          ) : (
            <p className="text-center">No soap notes found.</p>
          )}
        </>
      )}

      {createAdditionalNotes && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 text-sm">
            <div className="bg-white rounded-xs shadow-lg p-6 max-w-md w-full relative max-h-[80vh] overflow-y-auto mx-3">
              <div className="flex justify-between items-center gap-2 pb-4">
                <div className="flex justify-center items-center">
                  <p className="font-medium text-sm">
                    Create Additional Notes
                  </p>
                </div>
                <div>
                  <i
                    class="bx bx-x text-xl cursor-pointer"
                    onClick={() => {
                      setCreateAdditionalNotes(false);
                    }}
                  ></i>
                </div>
              </div>
              <div>
  <label className="block text-[12px] font-medium text-gray-600 mb-1">
    Note Description
  </label>
  <textarea
    rows="5"
    className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3E4095] focus:border-[#3E4095] resize-none transition-all placeholder:text-gray-400"
    placeholder="Enter patient observations, medical history updates, or specific care instructions..."
    value={noteDescription} // Ensure you have this state defined
    onChange={(e) => setNoteDescription(e.target.value)}
  ></textarea>
  
  <div className="flex justify-end mt-1">
    <p className="text-[10px] text-gray-400">
      {noteDescription?.length || 0} characters
    </p>
  </div>

  <button
    className="w-full mt-4 bg-[#3E4095] text-white py-2 rounded-full text-sm font-medium hover:bg-opacity-90 transition-colors"
    onClick={() => {
      toast.success("Work in Progress...");
      setCreateAdditionalNotes(false);
    }}
  >
    Save Note
  </button>
</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const getTabs = ({
  medloading,
  soapNotesLoading,
  patientMedRecords,
  patientFullInfo,
  count,
  currentPage,
  totalPages,
  setCurrentPage, // Use the setter here
  setSelectedMedicalRecord,
  setViewDetailMedicalRecord,
  patientSoapNotes,
  soapCount,
  soapCurrentPage,
  soapTotalPages,
  setSoapCurrentPage,
}) => [
    {
      title: "Patient Info",
      content: <PatientInfo patientFullInfo={patientFullInfo} />,
    },
    {
      title: "Med Records",
      content: (
        <PatientMedicalRecord
          medloading={medloading}
          patientMedRecords={patientMedRecords}
          count={count}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          setSelectedMedicalRecord={setSelectedMedicalRecord}
          setViewDetailMedicalRecord={setViewDetailMedicalRecord}
        />
      ),
    },
    {
      title: "SOAP Notes",
      content: (
        <PatientSOAPNotes
          soapNotesLoading={soapNotesLoading}
          patientSoapNotes={patientSoapNotes}
          soapCount={soapCount}
          soapCurrentPage={soapCurrentPage}
          soapTotalPages={soapTotalPages}
          setSoapCurrentPage={setSoapCurrentPage}
        />
      ),
    },
  ];

export default getTabs;
