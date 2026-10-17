import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FlaskConical } from "lucide-react";
import axiosInstanceHos from "../../../../../lib/axios/hospital";
import Hospital_Lab_Test_Detail_Dashboard from "../../../../../Dashboard/Hospital_Dashboard/Hospital_Lab/Hospital_Lab_Test_Detail_Dashboard";
import useDebounce from "../../../../../hooks/useDebounce";
import ScanLabResultsShell from "./ScanLabResultsShell";
import ScanLabResultCard, { ScanLabResultGridSkeleton } from "./ScanLabResultCard";
import { formatOrderStatus, formatApprovalStatus, flattenDoctorLabResults } from "./scanLabResults";

const PAGE_SIZE = 9;
const FETCH_SIZE = 200;

const Hospital_Doctors_Lab_Results_Tab = ({ activeTab, onTabChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedSqid, setSelectedSqid] = useState(null);

  // results-for-review only returns results still waiting on the lab admin, so build the
  // doctor's list from their own orders: lab-admin-approved (awaiting the doctor) first, then reviewed ones
  const { data: labOrdersData, isLoading: labLoading } = useQuery({
    queryKey: ["doctor-lab-records", debouncedSearch, ordering],
    queryFn: async () => {
      let url = `api/lab/doctor-test-orders?page=1&size=${FETCH_SIZE}&ordering=${ordering}`;
      if (debouncedSearch) {
        url += `&search=${encodeURIComponent(debouncedSearch)}`;
      }
      const res = await axiosInstanceHos.get(url);
      return res.data;
    },
    placeholderData: (prev) => prev,
    // Results come back from the lab — poll so the doctor sees new ones without reloading.
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const doctorResults = useMemo(() => flattenDoctorLabResults(labOrdersData?.results), [labOrdersData]);

  const count = doctorResults.length;
  const totalPages = Math.ceil(count / PAGE_SIZE);
  const patientLabRecords = doctorResults.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  // Re-read from the latest fetch so the detail updates after the doctor approves or rejects
  const selectedRecord = selectedSqid ? doctorResults.find((r) => r.sqid === selectedSqid) : null;

  if (selectedRecord) {
    return (
      <Hospital_Lab_Test_Detail_Dashboard
        orderIdProp={selectedRecord}
        onBackProp={() => setSelectedSqid(null)}
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
      {labLoading && patientLabRecords.length === 0 ? (
        <ScanLabResultGridSkeleton label="Loading lab results" />
      ) : patientLabRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <FlaskConical size={36} className="opacity-25 mb-2" />
          <h2 className="font-medium pb-1 text-gray-800">No lab results!</h2>
          <p className="text-[12px] text-gray-500 max-w-md text-center">There are no lab results approved by the lab admin yet.</p>
        </div>
      ) : (
        <div className="text-[12px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {patientLabRecords.map((record) => {
            const info = record.patient_info;
            const submittedBy = record.result_info?.submitted_by_info;
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
                  {
                    label: "Test Order Status",
                    value: formatOrderStatus(record.status).label,
                    className: formatOrderStatus(record.status).className,
                  },
                  {
                    label: "Approval Status",
                    value: formatApprovalStatus(approvalStatus, record.status).label,
                    className: formatApprovalStatus(approvalStatus, record.status).className,
                  },
                ]}
                reporter={submittedBy ? `${submittedBy.firstname} ${submittedBy.lastname}` : "N/A"}
                dateTime={
                  record.result_info?.created_at
                    ? new Date(record.result_info.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                    : "N/A"
                }
                onOpen={() => setSelectedSqid(record.sqid)}
              />
            );
          })}
        </div>
      )}
    </ScanLabResultsShell>
  );
};

export default Hospital_Doctors_Lab_Results_Tab;
