import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, ScanLine } from "lucide-react";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { fetchPatientApprovedScanResults } from "../../../../../queries/Hospital/radiology/scan_results";
import ScanResultReport from "../../Hospital_Radiology/Scan_Requests/ScanResultReport";
import ScanLabResultCard from "../Scan_Lab_Results/ScanLabResultCard";

// Approved radiology results for one patient; results still awaiting the doctor's approval stay on the Scan/Lab Results page.
const PatientRadiologyRecords = ({ patientFullInfo }) => {
  const patient = patientFullInfo?.patient_info;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScan, setSelectedScan] = useState(null);

  const { data: records = [], isLoading, isError } = useQuery({
    queryKey: ["patient-approved-scan-results", patient?.hin, patient?.lastname],
    queryFn: fetchPatientApprovedScanResults,
    enabled: !!patient?.hin,
    staleTime: 30 * 1000,
  });

  const filteredRecords = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return records;
    return records.filter((rec) =>
      [rec.scan_type, rec.report?.reporter, ...(rec.report?.impression || [])].some((field) =>
        field?.toLowerCase().includes(term)
      )
    );
  }, [records, searchQuery]);

  if (selectedScan) {
    return (
      <div className="text-sm">
        <button
          type="button"
          onClick={() => setSelectedScan(null)}
          className="flex items-center gap-1 cursor-pointer border-b pb-3 w-full"
        >
          <ArrowLeft size={14} />
          <span>Radiology results</span>
        </button>

        <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-400">Imaging order:</p>
            <p className="text-sm font-bold text-docuhealth-dark">{selectedScan.scan_type}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-400">Requested by:</p>
            <p className="text-sm font-semibold text-docuhealth-dark">{selectedScan.requested_by}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-400">Date/Time of scan request:</p>
            <p className="text-sm font-semibold text-docuhealth-dark">{formatFullDateTime(selectedScan.created_at) || "—"}</p>
          </div>
        </div>

        <ScanResultReport report={selectedScan.report} attachments={selectedScan.attachments} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-5 h-5 border-2 border-docuhealth-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Loading radiology results...</span>
        </div>
      </div>
    );
  }

  if (isError || records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <ScanLine size={36} className="opacity-25 mb-2" />
        <h2 className="font-medium pb-1 text-gray-800">
          {isError ? "Couldn't load radiology results" : "No radiology results!"}
        </h2>
        <p className="text-[12px] text-gray-500 max-w-md text-center">
          {isError
            ? "Something went wrong while fetching this patient's scans. Please try again."
            : "This patient has no approved radiology results yet. Results appear here once they are approved."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="font-medium text-gray-900 text-sm">Radiology results ({filteredRecords.length})</h3>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search scan, reporter or impression..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-docuhealth-primary focus:bg-white transition-colors"
          />
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <p className="text-[12px] text-gray-500 text-center py-10">No results match your search.</p>
      ) : (
        <div className="text-[12px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredRecords.map((scan) => (
            <ScanLabResultCard
              key={scan.sqid}
              title={scan.scan_type}
              badge="Imaging result"
              statusRows={[{ label: "Approval Status", value: "Approved", className: "text-green-600" }]}
              reporter={scan.report?.reporter || "N/A"}
              dateTime={formatFullDateTime(scan.report?.reported_at) || "N/A"}
              onOpen={() => setSelectedScan(scan)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientRadiologyRecords;
