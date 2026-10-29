import React, { useState, useContext } from "react";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import AdvanceCheckUpTabComponent from "./AdvanceCheckUpTabComponent";
import { getAdvanceCheckUpTabs, PatientInfoSkeleton, LatestVitalsSkeleton } from "./AdvanceCheckUpTabDetails";
import Skeleton, { SkeletonText } from "../../../../ui/Skeleton";
import { NursesAdmittedPatientMGTContext } from "../../../../../context/HospitalContext/Nurses/NursesAdmittedPatientMGTContext";
import Modal from "../../../../ui/Modal";
import NursingDischargeSummaryView from "./NursingDischargeSummaryView";
import DischargedPatientRecord from "../../../../ui/DischargedPatientRecord";
import { useAdmissionTaskCounts } from "../../../../../queries/Hospital/nurse/taskOccurrences";

const AdvanceCheckUp = ({ selected, setAdvanceCheckUp, setSharedSoapNoteDetail, loadingAdmission }) => {
  const context = useContext(NursesAdmittedPatientMGTContext);
  const isOutPatient = context?.tab === "outpatient" || context?.tab === "outpatient_discharge";
  const hin = (selected?.patient_info?.hin || selected?.patient?.hin || selected?.patient_hin);
  const [activeTab, setActiveTab] = useState("info");
  const [showDischargeSummaryModal, setShowDischargeSummaryModal] = useState(false);
  const [historyScope, setHistoryScope] = useState("stay");

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

  const patient = {
    ...(selected?.patient_info || {}),
    ...(selected?.patient || {}),
    ...(patientFullInfo?.patient_info || {}),
  };
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

  const isDischarged = context?.tab === "inpatient_discharge" ||
    context?.tab === "outpatient_discharge" ||
    Boolean(selected?.discharge_date || selected?.closed_at) ||
    selected?.status === "inpatient_discharge" ||
    selected?.status === "outpatient_discharge";

  // The patient record loads in the background: the header and tab strip come from the
  // list row, and only the tabs that read the full record show a skeleton meanwhile.
  const loadingRecord = isLoading || loadingAdmission;
  const taskCounts = useAdmissionTaskCounts(admission?.sqid, !isOutPatient && !isDischarged);
  const allTabs = getAdvanceCheckUpTabs(patient, admission, patientFullInfo, formatDate, formatDateTime, setSharedSoapNoteDetail, isOutPatient, setAdvanceCheckUp, historyScope, setHistoryScope)
    .map((t) =>
      t.status === "tasks" ? { ...t, badge: taskCounts.pending }
      : t.status === "in_progress_tasks" ? { ...t, badge: taskCounts.inProgress }
      : t);
  const tabs = loadingRecord
    ? allTabs.map((t) =>
        t.status === "info" ? { ...t, content: <PatientInfoSkeleton /> }
        : t.status === "latest_vitals" ? { ...t, content: <LatestVitalsSkeleton /> }
        : t)
    : allTabs;

  if (isDischarged) {
    // DischargedPatientRecord fetches the same patient record itself (shared query), so
    // like the doctor view it opens straight away; only wait while the row is unknown.
    if (loadingAdmission) {
      return <PatientInfoSkeleton />;
    }
    return (
      <DischargedPatientRecord
        patient={patient}
        admission={admission}
        isOutPatient={isOutPatient}
        onBack={() => setAdvanceCheckUp(false)}
      />
    );
  }

  return (
    <div>
      {showDischargeSummaryModal ? (
        <>
          <div className="mb-6">
            <div
              className="flex items-center gap-2 cursor-pointer text-gray-800 hover:text-black font-semibold text-[17px]"
              onClick={() => setShowDischargeSummaryModal(false)}
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
          <NursingDischargeSummaryView 
              patient={patient} 
              admission={admission} 
              patientFullInfo={patientFullInfo} 
              onCancel={() => setShowDischargeSummaryModal(false)} 
              safeFormatDate={formatDateTime}
              formatDateTime={formatDateTime}
          />
        </>
      ) : (
        <>
          <div className="border-b pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div
                className="flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
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
                <span>Patient's Details</span>
              </div>
              {(context?.tab === "inpatient_discharge" ||
                context?.tab === "outpatient_discharge" ||
                selected?.discharge_date ||
                selected?.closed_at ||
                selected?.status === "inpatient_discharge" ||
                selected?.status === "outpatient_discharge") && (
                <button 
                    onClick={() => setShowDischargeSummaryModal(true)}
                    className="w-full sm:w-auto text-center bg-white border border-docuhealth-primary text-docuhealth-primary text-sm font-medium px-5 py-2.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
                >
                    View discharge patient note summary
                </button>
              )}
            </div>
          </div>

      <>
          {/* Header Profile */}
          {!patient?.firstname && loadingRecord ? (
            <div role="status" aria-label="Loading patient" className="flex items-center py-5 border-b">
              <Skeleton className="w-14 h-14 rounded-full shrink-0" />
              <div className="ml-2">
                <SkeletonText textClassName="text-sm" className="h-3.5 w-32" />
                <SkeletonText textClassName="text-[12px]" className="h-3 w-14" />
              </div>
            </div>
          ) : (
          <div className="flex items-center py-5 border-b">
            <div className="w-14 h-14 rounded-full bg-gray-300 flex justify-center items-center text-xl font-semibold shrink-0">
              {`${patient?.firstname?.[0] ?? ""}${patient?.lastname?.[0] ?? ""}`.toUpperCase()}
            </div>
            <div className="ml-2 flex flex-col items-start">
              <p className="text-sm font-medium">
                {patient?.firstname} {patient?.lastname}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-[12px] text-gray-500">patient</p>
                {(selected?.patient_info?.payment_provider?.type || patientFullInfo?.patient_info?.payment_provider?.type) && (
                  <span className="text-[10px] font-bold uppercase bg-docuhealth-light-green text-docuhealth-green px-2 py-0.5 rounded-full">
                    {selected?.patient_info?.payment_provider?.type || patientFullInfo.patient_info.payment_provider.type}
                  </span>
                )}
              </div>
            </div>
          </div>
          )}

          <AdvanceCheckUpTabComponent 
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </>
      </>
    )}
    </div>
  );
};

export default AdvanceCheckUp;
