import React, { useState } from "react";
import { User, Building2 } from "lucide-react";
import Hospital_Lab_Test_Detail_Dashboard from "../../../../../Dashboard/Hospital_Dashboard/Hospital_Lab/Hospital_Lab_Test_Detail_Dashboard";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";
import CardGridSkeleton from "../../../../ui/CardGridSkeleton";
import { formatOrderStatus, formatApprovalStatus } from "../Scan_Lab_Results/scanLabResults";

const PatientLabRecords = ({
  patientLabRecords = [],
  count = 0,
  currentPage = 1,
  totalPages = 1,
  setCurrentPage,
  labloading = false,
}) => {
  const [selectedSqid, setSelectedSqid] = useState(null);
  const selectedRecord = selectedSqid ? (patientLabRecords || []).find((r) => r.sqid === selectedSqid) : null;

  if (labloading && patientLabRecords.length === 0) {
    return <CardGridSkeleton label="Loading lab records" />;
  }

  if (selectedRecord) {
    return (
      <div>
        <Hospital_Lab_Test_Detail_Dashboard
          orderIdProp={selectedRecord}
          onBackProp={() => setSelectedSqid(null)}
          isDoctorView={true}
        />
      </div>
    );
  }

  if (!patientLabRecords || patientLabRecords.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center text-center py-10 h-full">
        <svg
          width="180"
          height="180"
          viewBox="0 0 366 366"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="183" cy="171" r="159" fill="#F1F5F9" />
          <circle cx="183" cy="171" r="132" fill="#F8FAFC" />
          <path
            d="M183 233.5C148.482 233.5 120.5 205.518 120.5 171C120.5 136.482 148.482 108.5 183 108.5C217.518 108.5 245.5 136.482 245.5 171C245.5 205.518 217.518 233.5 183 233.5ZM183 221C210.614 221 233 198.614 233 171C233 143.386 210.614 121 183 121C155.386 121 133 143.386 133 171C133 198.614 155.386 221 183 221ZM176.75 139.75H189.25V152.25H176.75V139.75ZM176.75 164.75H189.25V202.25H176.75V164.75Z"
            fill="#94A3B8"
          />
        </svg>

        <h2 className="font-medium text-gray-800 text-base pb-1 mt-2">No lab results!</h2>
        <div className="max-w-md text-center">
          <p className="text-xs text-gray-500">
            This patient does not have any lab results available at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    // bottom padding keeps the pagination clear of the floating "+" button
    <div className="pb-20">
      <div className="text-[12px] grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {patientLabRecords.map((record) => {
          const title =
            record?.test_info?.name ||
            (record?.patient_info
              ? `${record.patient_info.firstname || ""} ${record.patient_info.lastname || ""}`
              : "Lab Test Order");
          const orderStatus = formatOrderStatus(record?.status);
          const approvalStatus = formatApprovalStatus(record?.result_info?.status, record?.status);
          const orderedBy = record?.ordered_by_info
            ? `Dr. ${record.ordered_by_info.firstname || ""} ${record.ordered_by_info.lastname || ""}`.trim()
            : "N/A";

          return (
            <div
              key={record.sqid || record.id}
              className="bg-white border rounded-xl p-4 flex flex-col h-full min-w-0 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="font-bold text-docuhealth-dark text-[15px] leading-snug min-w-0 break-words line-clamp-2" title={title}>
                  {title}
                </p>
                <span className="shrink-0 whitespace-nowrap bg-docuhealth-primary-muted text-docuhealth-primary text-[11px] font-medium px-3 py-1 rounded-full">
                  Lab result
                </span>
              </div>

              <dl className="grid grid-cols-[auto_1fr] gap-x-1.5 gap-y-1.5 text-xs">
                <dt className="text-gray-400">Test Order Status:</dt>
                <dd className={`font-semibold min-w-0 ${orderStatus.className}`}>{orderStatus.label}</dd>
                <dt className="text-gray-400">Approval Status:</dt>
                <dd className={`font-semibold min-w-0 ${approvalStatus.className}`}>{approvalStatus.label}</dd>
              </dl>

              <div className="flex flex-col gap-2 border-t border-gray-100 mt-3 pt-3 text-gray-500 text-[12px]">
                <p className="flex items-center gap-2 min-w-0">
                  <User size={14} className="shrink-0" />
                  <span className="truncate">{orderedBy}</span>
                </p>
                <p className="flex items-center gap-2 min-w-0">
                  <Building2 size={14} className="shrink-0" />
                  <span className="truncate">{record?.hospital_info?.name || "N/A"}</span>
                </p>
              </div>

              {/* mt-auto pins the button to the bottom so buttons line up across a row */}
              <div className="mt-auto pt-3">
                <button
                  onClick={() => setSelectedSqid(record.sqid)}
                  className="w-full bg-docuhealth-primary hover:bg-docuhealth-dark-primary text-white text-[12px] font-medium py-2 rounded-full transition-colors cursor-pointer"
                >
                  Open
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && setCurrentPage && (
        <div className="mt-4">
          <Pagination2
            count={count}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default PatientLabRecords;
