import React from "react";
import PropTypes from "prop-types";
import { formatFullDateTime } from "../Dashboard/Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const staffName = (s) =>
  s ? `${s.role === "doctor" ? "Dr. " : ""}${s.firstname ?? ""} ${s.lastname ?? ""}`.trim() : null;

// One bed request from Recent Care Activities (GET /api/medical-records/events/<event_sqid>).
// `processed_by_info` is the receptionist who accepted or rejected it.
const AdmissionRequestDetailView = ({ request }) => {
  if (!request) return null;

  const status = (request.status || "pending").toLowerCase();
  const processedBy = staffName(request.processed_by_info);

  return (
    <div className="text-sm">
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <p className="font-medium text-docuhealth-dark">Bed request</p>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
              STATUS_STYLES[status] || STATUS_STYLES.pending
            }`}
          >
            {status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px] text-gray-500 mb-4">
          <p>
            Ward:{" "}
            <span className="font-medium text-gray-900 capitalize">
              {request.ward_info?.name || "—"}
            </span>
          </p>
          <p>
            Bed:{" "}
            <span className="font-medium text-gray-900">
              {request.bed_info?.bed_number != null ? `#${request.bed_info.bed_number}` : "—"}
            </span>
          </p>
          <p>
            Requested by:{" "}
            <span className="font-medium text-gray-900">
              {staffName(request.requested_by_info) || "—"}
            </span>
          </p>
          <p>
            Requested on:{" "}
            <span className="font-medium text-gray-900">
              {formatFullDateTime(request.created_at) || "—"}
            </span>
          </p>
          {processedBy && (
            <p>
              {status === "rejected" ? "Rejected by" : "Accepted by"}:{" "}
              <span className="font-medium text-gray-900">{processedBy}</span>
            </p>
          )}
          {request.processed_at && (
            <p>
              {status === "rejected" ? "Rejected on" : "Accepted on"}:{" "}
              <span className="font-medium text-gray-900">
                {formatFullDateTime(request.processed_at)}
              </span>
            </p>
          )}
        </div>

        {request.rejection_reason && (
          <>
            <p className="text-[12px] text-gray-400 mb-1">Reason for rejection</p>
            <p className="text-[12px] text-gray-700">{request.rejection_reason}</p>
          </>
        )}
      </div>
    </div>
  );
};

AdmissionRequestDetailView.propTypes = {
  request: PropTypes.object,
};

export default AdmissionRequestDetailView;
