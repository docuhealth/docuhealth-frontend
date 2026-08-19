import React, { useState } from "react";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import AdvanceCheckUpTabComponent from "./AdvanceCheckUpTabComponent";
import { getAdvanceCheckUpTabs } from "./AdvanceCheckUpTabDetails";

const AdvanceCheckUp = ({ selected, setAdvanceCheckUp, setSharedSoapNoteDetail }) => {
  const hin = (selected?.patient_info?.hin || selected?.patient?.hin);
  const [activeTab, setActiveTab] = useState("info");

  const { data: patientFullInfo, isLoading, isError } = useQuery({
    queryKey: ["patient-info", hin],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(`api/doctors/patient/info/${hin}`);
      return res.data;
    },
    enabled: !!hin,
    staleTime: 5 * 60 * 1000,
  });

  if (isError) {
    toast.error("Failed to load patient information");
  }

  const patient = selected?.patient_info || patientFullInfo?.patient_info || {};
  const admission = selected || {};
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer text-gray-800 hover:text-black font-semibold text-[17px]"
            onClick={() => {
              setAdvanceCheckUp(false);
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.56528 6.41685H11.6654V7.58352H4.56528L7.69426 10.7125L6.86932 11.5374L2.33203 7.00019L6.86932 2.46289L7.69426 3.28785L4.56528 6.41685Z"
                fill="currentColor"
              />
            </svg>
            <p>Patient's details</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-sm text-gray-500">Loading patient data...</p>
        </div>
      ) : (
        <>
          {/* Header Profile */}
          <div className="flex items-center border-b pb-6 mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-200 text-gray-600 flex justify-center items-center text-2xl font-medium shrink-0">
              {`${patient?.firstname?.[0] ?? ""}${patient?.lastname?.[0] ?? ""}`.toUpperCase()}
            </div>
            <div className="ml-4 flex flex-col">
              <h2 className="text-xl font-semibold text-gray-900">
                {patient?.firstname} {patient?.lastname}
              </h2>
              <p className="text-sm text-green-500 font-medium mt-1">HMO Patient</p>
            </div>
          </div>

          <AdvanceCheckUpTabComponent 
            tabs={getAdvanceCheckUpTabs(patient, admission, patientFullInfo, formatDate, formatDateTime, setSharedSoapNoteDetail)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </>
      )}
    </div>
  );
};

export default AdvanceCheckUp;
