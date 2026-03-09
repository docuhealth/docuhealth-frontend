import React, { useState, useEffect, useContext } from "react";
import { ArrowLeft } from "lucide-react";
import axiosInstanceHos from "../../../../../utils/axiosInstanceHos";
import toast from "react-hot-toast";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import TabComponent2 from "./TabComponent2";
import getTabs from "./TabDetails2";
import { DoctorsAdmittedPatientMGTContext } from "../../../../../context/HospitalContext/Doctors/DoctorsAdmittedPatientMGTContext";
import { useQuery } from "@tanstack/react-query";

const AdvanceCheckUp = ({ selected, setAdvanceCheckUp, setSoapNoteEntry, advanceCheckUpSource }) => {
  const { setTab } = useContext(DoctorsAdmittedPatientMGTContext);

  const hin = selected?.patient?.hin;
  const pageSize = 6;

  const [currentPage, setCurrentPage] = useState(1);
  const [soapCurrentPage, setSoapCurrentPage] = useState(1);

  const [viewDetailMedicalRecord, setViewDetailMedicalRecord] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);



  const { data: patientFullInfo, isLoading: loadingInfo } = useQuery({
    queryKey: ["patient-info", hin],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(`api/doctors/patient/info/${hin}`);
      return res.data;
    },
    enabled: !!hin,
    onError: () => toast.error("Error fetching patient's details"),
  });



  const { data: medRecordsData, isLoading: medLoading } = useQuery({
    queryKey: ["patient-med-records", hin, currentPage],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(
        `api/doctors/patient/records/${hin}?page=${currentPage}&size=${pageSize}`,
      );
      return res.data;
    },
    enabled: !!hin,
    keepPreviousData: true,
  });

  const { data: soapNotesData, isLoading: soapLoading } = useQuery({
    queryKey: ["patient-soap-notes", hin, soapCurrentPage],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(
        `api/medical-records/soap-note/${hin}?page=${soapCurrentPage}&size=${pageSize}`,
      );
      return res.data;
    },
    enabled: !!hin,
  });


  return (
    <>
      <div className="flex items-center gap-1 cursor-pointer border-b pb-3">
        <div
          onClick={() => {
            setAdvanceCheckUp(false);
            // console.log(advanceCheckUpSource)
            setTab(advanceCheckUpSource)
          }}
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
        </div>

        <p>Patient's Details</p>
      </div>
      {loadingInfo ? (
        /* Basic Loading State */
        <div className="flex justify-center items-center gap-3 px-2 py-3">
          <p className="text-sm text-gray-500 pt-2">Loading patient data...</p>
        </div>
      ) : (
        <>
          <div className="py-5 border-b">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center text-xl font-semibold">
                {`${patientFullInfo?.patient_info?.firstname?.[0] ?? ""}${patientFullInfo?.patient_info?.lastname?.[0] ?? ""}`.toUpperCase()}
              </div>

              <div className="flex flex-col items-start">
                <p className="ml-2 text-sm font-medium">
                  {patientFullInfo?.patient_info?.firstname}{" "}
                  {patientFullInfo?.patient_info?.lastname}
                </p>
                <p className="ml-2 text-[12px] text-gray-500">patient</p>
              </div>
            </div>
          </div>
          <TabComponent2
            tabs={getTabs({

              medloading: medLoading,
              soapNotesLoading: soapLoading,
              patientMedRecords: medRecordsData?.results || [],
              patientSoapNotes: soapNotesData?.results || [],
              patientFullInfo,

              selected,

              count: medRecordsData?.count || 0,
              currentPage,
              totalPages: Math.ceil(
                (medRecordsData?.count || 0) / pageSize,
              ),

              setCurrentPage,


              soapCount: soapNotesData?.count || 0,
              soapCurrentPage,
              soapTotalPages: Math.ceil(
                (soapNotesData?.count || 0) / pageSize,
              ),

              setSoapCurrentPage,


              setSelectedMedicalRecord, // first
              setViewDetailMedicalRecord, // second

              setSoapNoteEntry,
              setAdvanceCheckUp,
            })}
          />
        </>
      )}
    </>
  );
};

export default AdvanceCheckUp;
