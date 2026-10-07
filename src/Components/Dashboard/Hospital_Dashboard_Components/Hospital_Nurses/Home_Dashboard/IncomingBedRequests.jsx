import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWardAdmissionRequests } from "../../../../../queries/Hospital/nurse/admissionRequests";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { extractApiErrorMessage } from "../../../../../utils/apiError";

const IncomingBedRequests = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["nurse-ward-admission-requests", page],
    queryFn: fetchWardAdmissionRequests,
    refetchInterval: 60 * 1000,
  });

  const requests = data?.results || [];
  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / 5));

  if (isLoading) return <p className="text-sm text-gray-500 py-4 text-center">Loading...</p>;

  // The API errors when the nurse has no ward assigned.
  if (isError) {
    return (
      <p className="text-sm text-gray-500 py-4 text-center">
        {extractApiErrorMessage(error, "Could not load bed requests for your ward.")}
      </p>
    );
  }

  if (requests.length === 0) {
    return <p className="text-sm text-gray-500 py-4 text-center">No pending bed requests for your ward.</p>;
  }

  return (
    <div className="text-sm">
      <ul className="divide-y divide-gray-200">
        {requests.map((r) => (
          <li key={r.sqid} className="py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1">
            <div>
              <p className="font-semibold text-gray-800">
                {r.patient_info?.firstname} {r.patient_info?.lastname}
              </p>
              <p className="text-xs text-gray-500">
                Bed {r.bed_info?.bed_number ?? "NIL"}
                {r.requested_by_info && ` · requested by Dr. ${r.requested_by_info.firstname} ${r.requested_by_info.lastname}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-gray-500">{formatFullDateTime(r.created_at)}</p>
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                Awaiting reception
              </span>
            </div>
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-3 pt-3 text-xs">
          <button
            className="text-docuhealth-primary disabled:text-gray-300 cursor-pointer disabled:cursor-not-allowed"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-gray-500">{page} / {totalPages}</span>
          <button
            className="text-docuhealth-primary disabled:text-gray-300 cursor-pointer disabled:cursor-not-allowed"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default IncomingBedRequests;
