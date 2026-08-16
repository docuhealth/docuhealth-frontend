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
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import {useMutation, useQueryClient } from "@tanstack/react-query";
import PatientInfoCard from "../../../../ui/PatientInfoCard";
const PatientInfo = ({ patientFullInfo }) => {
  console.log(patientFullInfo);
  return (
    <>
      <PatientInfoCard 
        selectedMedicalRecord={patientFullInfo} 
        className="my-5 bg-docuhealth-light-gray rounded-lg border p-4"
      />
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