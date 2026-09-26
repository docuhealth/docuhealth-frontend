import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FlaskConical } from "lucide-react";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import Hospital_Lab_Test_Detail_Dashboard from "../../../../../Dashboard/Hospital_Dashboard/Hospital_Lab/Hospital_Lab_Test_Detail_Dashboard";
import useDebounce from "../../../../../hooks/useDebounce";
import ScanLabResultsShell from "./ScanLabResultsShell";
import ScanLabResultCard from "./ScanLabResultCard";

const PAGE_SIZE = 9;

const approvalClass = (status) => {
  if (status === "approved" || status === "accepted") return "text-docuhealth-green";
  if (status === "rejected") return "text-red-500";
  if (status === "pending") return "text-amber-500";
  return "text-gray-500";
};

const Hospital_Doctors_Lab_Results_Tab = ({ activeTab, onTabChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const { data: labRecordsData, isLoading: labLoading } = useQuery({
    queryKey: ["doctor-lab-records", currentPage, debouncedSearch, ordering],
    queryFn: async () => {
      let url = `api/lab/test-orders/results-for-review?page=${currentPage}&size=${PAGE_SIZE}&ordering=${ordering}`;
      if (debouncedSearch) {
        url += `&search=${encodeURIComponent(debouncedSearch)}`;
      }
      const res = await axiosInstanceHos.get(url);
      return res.data;
    },
    keepPreviousData: true,
    // Results come back from the lab scientist — poll so the doctor sees
    // "completed" without reloading. Pauses while the tab is backgrounded.
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const patientLabRecords = labRecordsData?.results || [];
  const count = labRecordsData?.count || 0;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  if (selectedRecord) {
    return (
      <Hospital_Lab_Test_Detail_Dashboard
        orderIdProp={selectedRecord}
        onBackProp={() => setSelectedRecord(null)}
        isDoctorView={true}
      />
    );
  }

  return (
    <ScanLabResultsShell
      activeTab={activeTab}
      onTabChange={onTabChange}
      searchQuery={searchQuery}
      onSearchChange={(value) => {
        setSearchQuery(value);
        setCurrentPage(1);
      }}
      searchPlaceholder="Search name or ID..."
      ordering={ordering}
      onOrderingChange={(value) => {
        setOrdering(value);
        setCurrentPage(1);
      }}
      count={count}
      currentPage={currentPage}
      totalPages={totalPages}
      setCurrentPage={setCurrentPage}
    >
      {labLoading ? (
        <div className="flex justify-center items-center h-40 text-sm">Loading...</div>
      ) : patientLabRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <FlaskConical size={36} className="opacity-25 mb-2" />
          <h2 className="font-medium pb-1 text-gray-800">No lab results!</h2>
          <p className="text-[12px] text-gray-500 max-w-md text-center">There are no lab results to approve at the moment.</p>
        </div>
      ) : (
        <div className="text-[12px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {patientLabRecords.map((record) => {
            const info = record.patient_info;
            const submittedBy = record.result_info?.submitted_by;
            const approvalStatus = record.result_info?.status;
            return (
              <ScanLabResultCard
                key={record.sqid || record.id}
                title={record.test_info?.name || "Lab Test"}
                badge="Lab result"
                patient={
                  info && {
                    name: `${info.firstname ?? ""} ${info.lastname ?? ""}`.trim() || "Unknown patient",
                    hin: info.hin,
                  }
                }
                statusRows={[
                  { label: "Test Order Status", value: record.status ? record.status.replace("_", " ") : "Ready", className: "text-docuhealth-green" },
                  { label: "Approval Status", value: approvalStatus || "N/A", className: approvalClass(approvalStatus) },
                ]}
                reporter={submittedBy ? `${submittedBy.firstname} ${submittedBy.lastname}` : "N/A"}
                dateTime={
                  record.result_info?.created_at
                    ? new Date(record.result_info.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                    : "N/A"
                }
                onOpen={() => setSelectedRecord(record)}
              />
            );
          })}
        </div>
      )}
    </ScanLabResultsShell>
  );
};

export default Hospital_Doctors_Lab_Results_Tab;
