import React from "react";
import PropTypes from "prop-types";
import { formatFullDateTime } from "../Dashboard/Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  sample_collected: "bg-blue-100 text-blue-700",
  result_ready: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const getRefRange = (p) => {
  if (p.ref_text) return p.ref_text;
  if (p.ref_low != null && p.ref_high != null) return `${p.ref_low}–${p.ref_high}`;
  return "—";
};

// Full read-only rendering of one lab test order, for "View Lab order" from
// Recent Care Activities (GET /api/medical-records/events/<event_sqid>).
// Read-only by design — accept/reject/log-sample/submit-result actions live
// on the lab dashboards, not here.
const LabOrderDetailView = ({ labOrder }) => {
  if (!labOrder) return null;

  const items = labOrder.items_info || [];
  const orderedBy = labOrder.ordered_by;
  const orderedByName = orderedBy
    ? `${orderedBy.role === "doctor" ? "Dr. " : ""}${orderedBy.firstname || ""} ${orderedBy.lastname || ""}`.trim()
    : "N/A";

  return (
    <div className="text-sm">
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="font-medium text-docuhealth-dark">Lab test order</p>
          <span className="text-[12px] text-gray-500">
            {formatFullDateTime(labOrder.created_at)}
          </span>
        </div>
        <p className="text-[12px] text-gray-500">
          Ordered by:{" "}
          <span className="font-medium text-gray-900">{orderedByName}</span>
        </p>
        {labOrder.note && (
          <p className="text-[12px] text-gray-500 mt-2">
            Note: <span className="text-gray-700">{labOrder.note}</span>
          </p>
        )}
      </div>

      {items.map((item) => {
        const status = (item.status || "pending").toLowerCase();
        const params = item.result_info?.parameters || [];

        return (
          <div
            key={item.sqid}
            className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-docuhealth-dark">
                {item.test_info?.name || "Unknown test"}
              </p>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  STATUS_STYLES[status] || STATUS_STYLES.pending
                }`}
              >
                {status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-[12px] text-gray-500 mb-2">
              Category:{" "}
              <span className="font-medium text-gray-900">
                {item.test_info?.category?.name || "N/A"}
              </span>
            </p>
            {item.specimen_collected_at && (
              <p className="text-[12px] text-gray-500 mb-2">
                Sample collected:{" "}
                <span className="font-medium text-gray-900">
                  {formatFullDateTime(item.specimen_collected_at)}
                </span>
              </p>
            )}
            {item.rejection_reason && (
              <p className="text-[12px] text-red-600 mb-2">
                Rejected: {item.rejection_reason}
              </p>
            )}
            {params.length > 0 && (
              <div className="mt-2 border-t border-gray-200 pt-2">
                {params.map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-[12px] text-gray-700 py-1"
                  >
                    <span>{p.parameter_info?.name}</span>
                    <span>
                      {p.value ?? "—"} {p.parameter_info?.unit || ""} (ref:{" "}
                      {getRefRange(p.parameter_info || {})})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {items.length === 0 && (
        <p className="text-[12px] text-gray-500 py-4">
          No test items found for this order.
        </p>
      )}
    </div>
  );
};

LabOrderDetailView.propTypes = {
  labOrder: PropTypes.object,
};

export default LabOrderDetailView;
