import React, { useState } from "react";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";
import formatRecordDate from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import {
  formatFullDateTime,
  getAge,
} from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { truncateWords } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
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
} from "../../../Patient_Dashboard_Components/Patient_Appointments_Dashboard/Components/Date_Time_Formatter";
import toast from "react-hot-toast";
import axiosInstanceHos from "../../../../../utils/axiosInstanceHos";
import {useMutation, useQueryClient } from "@tanstack/react-query";


const PatientInfo = ({ patientFullInfo }) => {
  console.log(patientFullInfo);
  return (
    <>
      <div className="my-5 bg-docuhealth-light-gray rounded-lg border p-4">
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
                [
                  patientFullInfo?.patient_info?.street,
                  patientFullInfo?.patient_info?.city,
                  patientFullInfo?.patient_info?.state,
                  patientFullInfo?.patient_info?.country
                ].filter(Boolean).join(", ") || "NIL"
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
    </>
  );
};

const getTabs = ({ patientFullInfo }) => [
  {
    title: 'Patient Info',
    content: <PatientInfo patientFullInfo={patientFullInfo} />,
  },
];

export default getTabs;