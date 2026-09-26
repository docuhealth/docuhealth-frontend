import React, { useState } from "react";
import Hospital_Lab_Test_Detail_Dashboard from "../../../../../Dashboard/Hospital_Dashboard/Hospital_Lab/Hospital_Lab_Test_Detail_Dashboard";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";

const PatientLabRecords = ({
  patientLabRecords = [],
  count = 0,
  currentPage = 1,
  totalPages = 1,
  setCurrentPage,
  labloading = false,
}) => {
  const [selectedRecord, setSelectedRecord] = useState(null);

  if (labloading) {
    return (
      <div className="flex justify-center items-center h-40 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-5 h-5 border-2 border-docuhealth-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Loading lab records...</span>
        </div>
      </div>
    );
  }

  if (selectedRecord) {
    return (
      <div>
        <Hospital_Lab_Test_Detail_Dashboard
          orderIdProp={selectedRecord}
          onBackProp={() => setSelectedRecord(null)}
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
    <>
      <div className="text-[12px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {patientLabRecords.map((record) => (
          <div
            key={record.sqid || record.id}
            className="bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex justify-between items-center mb-1">
              <p className="font-bold text-docuhealth-dark text-[15px] truncate mr-2">
                {record?.test_info?.name ||
                  (record?.patient_info
                    ? `${record.patient_info.firstname || ""} ${record.patient_info.lastname || ""}`
                    : "Lab Test Order")}
              </p>
              <div className="bg-docuhealth-primary-muted px-3 py-1 rounded-full shrink-0">
                <p className="text-docuhealth-primary text-[11px] font-medium">
                  Lab result
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mb-3">
              <div className="flex items-center gap-1">
                <p className="text-gray-400 text-xs">Test Order Status: </p>
                <p className="text-docuhealth-green text-xs font-semibold capitalize">
                  {record?.status ? record.status.replace("_", " ") : "Ready"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <p className="text-gray-400 text-xs">Approval Status: </p>
                <p
                  className={`text-xs font-semibold capitalize ${
                    record?.result_info?.status === "approved" ||
                    record?.result_info?.status === "accepted"
                      ? "text-docuhealth-green"
                      : record?.result_info?.status === "rejected"
                      ? "text-red-500"
                      : record?.result_info?.status === "pending"
                      ? "text-amber-500"
                      : "text-gray-500"
                  }`}
                >
                  {record?.result_info?.status || "N/A"}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 my-3"></div>

            <div className="flex items-center gap-2 mb-3">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500 shrink-0"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <p className="text-gray-500 text-[12px] truncate">
                {record?.ordered_by
                  ? `Dr. ${record.ordered_by.firstname || ""} ${record.ordered_by.lastname || ""}`
                  : "Dr. Medical Officer"}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500 mt-0.5 shrink-0"
              >
                <path d="M3 21h18"></path>
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
                <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path>
                <path d="M10 9h4"></path>
                <path d="M12 7v4"></path>
              </svg>
              <p className="text-gray-500 text-[12px] leading-snug truncate">
                {record?.hospital_info?.name
                  ? `${record.hospital_info.name} Hospital`
                  : "DocuHealth Hospital"}
              </p>
            </div>

            <div className="border-t border-gray-100 my-3"></div>

            <button
              onClick={() => setSelectedRecord(record)}
              className="w-full bg-docuhealth-primary hover:bg-docuhealth-dark-primary text-white text-[12px] font-medium py-2 rounded-full transition-colors cursor-pointer"
            >
              Open
            </button>
          </div>
        ))}
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
    </>
  );
};

export default PatientLabRecords;
