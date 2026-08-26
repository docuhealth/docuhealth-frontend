import React, { useState, useEffect, useContext } from "react";
import { ArrowLeft } from "lucide-react";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import toast from "react-hot-toast";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import TabComponent2 from "./TabComponent2";
import getTabs, { PatientSOAPNotes, PatientMedicalRecord } from "./TabDetails2";
import PatientMedicalRecordDetail from "./PatientMedicalRecordDetail";
import { DoctorsAdmittedPatientMGTContext } from "../../../../../context/HospitalContext/Doctors/DoctorsAdmittedPatientMGTContext";
import { useQuery } from "@tanstack/react-query";
import { fetchProgressNotes } from "../../../../../queries/Hospital/doctor/progressNotes";

const AdvanceCheckUp = ({
  selected,
  setAdvanceCheckUp,
  advanceCheckUpSource,
  dischargedView = "tabs",
  setDischargedView,
}) => {
  const { setTab } = useContext(DoctorsAdmittedPatientMGTContext);

  const hin = (selected?.patient_info?.hin || selected?.patient?.hin);
  const pageSize = 6;

  const [currentPage, setCurrentPage] = useState(1);
  const [soapCurrentPage, setSoapCurrentPage] = useState(1);
  const [labCurrentPage, setLabCurrentPage] = useState(1);
  const [progressCurrentPage, setProgressCurrentPage] = useState(1);

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

  const { data: progressNotesData, isLoading: progressLoading } = useQuery({
    queryKey: ["patient-progress-notes", hin, progressCurrentPage, pageSize],
    queryFn: fetchProgressNotes,
    enabled: !!hin,
  });

  const { data: labRecordsData, isLoading: labLoading } = useQuery({
    queryKey: ["patient-lab-records", hin, labCurrentPage],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(
        `api/lab/test-orders/patient/${hin}?page=${labCurrentPage}&size=${pageSize}`,
      );
      return res.data;
    },
    enabled: !!hin,
    keepPreviousData: true,
  });

  // Discharged patients can drill from "Discharge Summary" into a specific
  // medical record; that record's own detail view already has a complete
  // back-arrow header + patient info card of its own (PatientMedicalRecordDetail),
  // so it takes over the whole panel instead of nesting under another header.
  const showingRecordDetail = dischargedView === "discharge-summary" && viewDetailMedicalRecord;

  return (
    <>
      <div className="bg-white my-5 border rounded-2xl pt-8 px-6 text-sm">
      {showingRecordDetail ? (
        <PatientMedicalRecordDetail
          selectedMedicalRecord={selectedMedicalRecord}
          setViewDetailMedicalRecord={setViewDetailMedicalRecord}
        />
      ) : dischargedView !== "tabs" ? (
        <>
          <div
            className="flex items-center gap-1 cursor-pointer border-b pb-3"
            onClick={() => setDischargedView("tabs")}
          >
            <ArrowLeft className="w-4 h-4 text-gray-800" />
            <p>{dischargedView === "soap-history" ? "SOAP Note History" : "Discharge Summary"}</p>
          </div>
          <div className="pt-5">
            {dischargedView === "soap-history" ? (
              <PatientSOAPNotes
                soapNotesLoading={soapLoading}
                patientSoapNotes={soapNotesData?.results || []}
                soapCount={soapNotesData?.count || 0}
                soapCurrentPage={soapCurrentPage}
                soapTotalPages={Math.ceil((soapNotesData?.count || 0) / pageSize)}
                setSoapCurrentPage={setSoapCurrentPage}
                selected={selected}
              />
            ) : (
              <PatientMedicalRecord
                medloading={medLoading}
                patientMedRecords={medRecordsData?.results || []}
                count={medRecordsData?.count || 0}
                currentPage={currentPage}
                totalPages={Math.ceil((medRecordsData?.count || 0) / pageSize)}
                setCurrentPage={setCurrentPage}
                setSelectedMedicalRecord={setSelectedMedicalRecord}
                setViewDetailMedicalRecord={setViewDetailMedicalRecord}
              />
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-1 cursor-pointer border-b pb-3">
            <div
              onClick={() => {
                setAdvanceCheckUp(false);
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
                  fill="var(--color-docuhealth-dark)"
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
                    <div className="ml-2 flex items-center gap-2">
                      <p className="text-[12px] text-gray-500">patient</p>
                      {(selected?.patient_info?.payment_provider?.type || patientFullInfo?.patient_info?.payment_provider?.type) && (
                        <span className="text-[10px] font-bold uppercase bg-docuhealth-light-green text-docuhealth-green px-2 py-0.5 rounded-full">
                          {selected?.patient_info?.payment_provider?.type || patientFullInfo.patient_info.payment_provider.type}
                        </span>
                      )}
                    </div>
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
                  advanceCheckUpSource,

                  count: medRecordsData?.count || 0,
                  currentPage,
                  totalPages: Math.ceil((medRecordsData?.count || 0) / pageSize),
                  setCurrentPage,

                  soapCount: soapNotesData?.count || 0,
                  soapCurrentPage,
                  soapTotalPages: Math.ceil((soapNotesData?.count || 0) / pageSize),
                  setSoapCurrentPage,

                  labloading: labLoading,
                  patientLabRecords: labRecordsData?.results || [],
                  labCount: labRecordsData?.count || 0,
                  labCurrentPage,
                  labTotalPages: Math.ceil((labRecordsData?.count || 0) / pageSize),
                  setLabCurrentPage,

                  progressNotesLoading: progressLoading,
                  patientProgressNotes: progressNotesData?.results || [],
                  progressCount: progressNotesData?.count || 0,
                  progressCurrentPage,
                  progressTotalPages: Math.ceil((progressNotesData?.count || 0) / pageSize),
                  setProgressCurrentPage,

                  setSelectedMedicalRecord,
                  setViewDetailMedicalRecord,
                  viewDetailMedicalRecord,
                  selectedMedicalRecord,
                })}
              />
            </>
          )}
        </>
      )}
      </div>
    </>
  );
};

export default AdvanceCheckUp;
