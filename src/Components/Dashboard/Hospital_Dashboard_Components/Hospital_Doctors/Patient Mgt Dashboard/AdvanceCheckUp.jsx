import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import axiosInstanceHos from "../../../../../utils/axiosInstanceHos";
import toast from "react-hot-toast";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home Dashboard/Components/formatRecordDate";
import TabComponent2 from "./TabComponent2";
import getTabs from "./TabDetails2";

const AdvanceCheckUp = ({ selected, setAdvanceCheckUp }) => {
  const [patientFullInfo, setPatientFullInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [patientMedRecords, setPatientMedRecords] = useState(null);
  const [patientSoapNotes, setPatientSoapNotes] = useState(null);

  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [soapCount, setSoapCount] = useState(0);
  const [soapCurrentPage, setSoapCurrentPage] = useState(1);
  const [soapTotalPages, setSoapTotalPages] = useState(1);

  const pageSize = 6;

  const [medloading, setMedLoading] = useState(false);

  const [soapNotesLoading, setSoapNotesLoading] = useState(false);

  const [viewDetailMedicalRecord, setViewDetailMedicalRecord] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);

  console.log(selected);

  const fetchPatientInfo = async () => {
    try {
      setLoading(true);
      const res = await axiosInstanceHos.get(
        `api/doctors/patient/info/${selected.patient.hin}`,
      );

      console.log(res.data);
      setPatientFullInfo(res.data);
    } catch (err) {
      console.error("Error fetching patient's details", err);
      toast.error("Error fetching patient's details");
    } finally {
      setLoading(false);
    }
  };
  const fetchPatientMedRecords = async (page = 1) => {
    try {
      setMedLoading(true);
      const res = await axiosInstanceHos.get(
        `api/doctors/patient/records/${selected.patient.hin}?page=${page}&size=${pageSize}`,
      );

      console.log(res.data);
      setPatientMedRecords(res.data.results || []);
      setCount(res.data.count || 0);
      setCurrentPage(page);
      setTotalPages(Math.ceil(res.data.count / pageSize));
    } catch (err) {
      console.error("Error fetching patient's medical records", err);
      toast.error("Error fetching patient's medical records");
    } finally {
      setMedLoading(false);
    }
  };

  const fetchPatientSoapNotes = async (page = 1) => {
    try {
      setSoapNotesLoading(true);
      const res = await axiosInstanceHos.get(
        `api/medical-records/soap-note/${selected.patient.hin}?page=${page}&size=${pageSize}`,
      );
      console.log(res.data);
      setPatientSoapNotes(res.data.results || []);
      setSoapCount(res.data.count || 0);
      setSoapCurrentPage(page);
      setSoapTotalPages(Math.ceil(res.data.count / pageSize));
    } catch (err) {
      console.error("Error fetching patient's soap notes", err);
      toast.error("Error fetching patient's soap notes");
    } finally {
      setSoapNotesLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientInfo();
    fetchPatientMedRecords(1);
    fetchPatientSoapNotes(1);
  }, []);

  return (
    <>
      <div className="flex items-center gap-1 cursor-pointer border-b pb-3">
        <div
          onClick={() => {
            setAdvanceCheckUp(false);
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
      {loading ? (
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
              patientMedRecords,
              medloading,
              patientSoapNotes,
              soapNotesLoading,

              patientFullInfo,
              count,
              currentPage,
              totalPages,
              fetchPatientMedRecords,
              setSelectedMedicalRecord, // first
              setViewDetailMedicalRecord, // second
              soapCount,
              soapCurrentPage,
              soapTotalPages,
              fetchPatientSoapNotes,
            })}
          />
        </>
      )}
    </>
  );
};

export default AdvanceCheckUp;
