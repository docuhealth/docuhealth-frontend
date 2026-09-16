import React from "react";
import PropTypes from "prop-types";
import VitalSignsCard from "./VitalSignsCard";
import { formatFullDateTime } from "../Dashboard/Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";

const TRIAGE_STYLES = {
  routine: "bg-green-100 text-green-700",
  urgent: "bg-orange-100 text-orange-700",
  emergency: "bg-red-100 text-red-700",
};

// Full read-only rendering of one nursing assessment (triage note + the
// vitals recorded alongside it) — same pattern as SoapNoteDetailView, for
// "View Nursing Assessment" from Recent Care Activities
// (GET /api/medical-records/events/<event_sqid>).
const NursingAssessmentDetailView = ({ nursingAssessment }) => {
  if (!nursingAssessment) return null;

  const staff = nursingAssessment.staff_info || {};
  const staffName = `${staff.firstname || ""} ${staff.lastname || ""}`.trim() || "N/A";
  const triage = (nursingAssessment.triage_priority || "routine").toLowerCase();

  return (
    <div className="text-sm">
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <p className="font-medium text-docuhealth-dark">Nursing assessment</p>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
              TRIAGE_STYLES[triage] || TRIAGE_STYLES.routine
            }`}
          >
            {triage} priority
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px] text-gray-500 mb-4">
          <p>
            Recorded by:{" "}
            <span className="font-medium text-gray-900">{staffName}</span>
          </p>
          <p>
            Recorded on:{" "}
            <span className="font-medium text-gray-900">
              {formatFullDateTime(nursingAssessment.created_at)}
            </span>
          </p>
        </div>

        <p className="text-[12px] text-gray-400 mb-1">Notes</p>
        <p className="text-[12px] text-gray-700 whitespace-pre-wrap">
          {nursingAssessment.notes || "NIL"}
        </p>
      </div>

      <VitalSignsCard
        className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg"
        vitalSigns={nursingAssessment.vital_signs}
        title="Vital signs recorded with this assessment"
      />
    </div>
  );
};

NursingAssessmentDetailView.propTypes = {
  nursingAssessment: PropTypes.object,
};

export default NursingAssessmentDetailView;
