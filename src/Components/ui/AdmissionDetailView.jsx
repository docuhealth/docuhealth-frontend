import React from "react";
import PropTypes from "prop-types";
import { formatFullDateTime } from "../Dashboard/Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700",
  awaiting_nurse_discharge: "bg-blue-100 text-blue-700",
  discharged: "bg-gray-200 text-gray-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
};

// Full read-only rendering of one admission, for "View Admission" / "View
// Admission request" from Recent Care Activities
// (GET /api/medical-records/events/<event_sqid>). `discharged_by` is left
// unrendered — the backend returns it populated even on a still-`pending`
// admission with no discharge_date, which reads as a data-modeling quirk
// rather than an actual discharge attribution.
const AdmissionDetailView = ({ admission }) => {
  if (!admission) return null;

  const status = (admission.status || "pending").toLowerCase();
  const ward = admission.ward_info?.name;
  const bedNumber = admission.bed_info?.bed_number;
  const hasDischargeForm = !!(
    admission.doctor_discharge_form || admission.nurse_discharge_form
  );

  return (
    <div className="text-sm">
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <p className="font-medium text-docuhealth-dark">Admission</p>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
              STATUS_STYLES[status] || STATUS_STYLES.pending
            }`}
          >
            {status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px] text-gray-500 mb-4">
          <p>
            Ward:{" "}
            <span className="font-medium text-gray-900 capitalize">
              {ward || "Not yet assigned"}
            </span>
          </p>
          <p>
            Bed:{" "}
            <span className="font-medium text-gray-900">
              {bedNumber != null ? `#${bedNumber}` : "Not yet assigned"}
            </span>
          </p>
          <p>
            Admission date:{" "}
            <span className="font-medium text-gray-900">
              {admission.admission_date
                ? formatFullDateTime(admission.admission_date)
                : "Pending confirmation"}
            </span>
          </p>
          {admission.discharge_date && (
            <p>
              Discharge date:{" "}
              <span className="font-medium text-gray-900">
                {formatFullDateTime(admission.discharge_date)}
              </span>
            </p>
          )}
        </div>

        {hasDischargeForm && (
          <>
            <p className="text-[12px] text-gray-400 mb-1">Discharge forms</p>
            <p className="text-[12px] text-gray-700">
              {admission.doctor_discharge_form && "Doctor discharge form filed. "}
              {admission.nurse_discharge_form && "Nurse discharge form filed."}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

AdmissionDetailView.propTypes = {
  admission: PropTypes.object,
};

export default AdmissionDetailView;
