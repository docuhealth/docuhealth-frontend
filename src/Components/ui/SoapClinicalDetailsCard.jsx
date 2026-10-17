import React from "react";
import PropTypes from "prop-types";
import { renderListOrString } from "../../utils/soapNoteHelpers";

// Renders the full clinical body of a SOAP note (history, exam findings,
// diagnosis, drug history/allergies, problems list, education) — everything
// beyond vitals, documents, care instructions, treatment plan, additional
// notes and referral, which the callers render separately.
//
// This mirrors the shape the SOAP note API actually returns (see
// api/records/soap-note/{hin}), unlike ClinicalSummaryCard, which
// expects a generic `selectedMedicalRecord` object shaped for the
// patient-facing summary (history/diagnosis/physical_exam) and was being
// passed these same granular props by mistake — causing it to silently
// render nothing.
const SoapClinicalDetailsCard = ({
  historyOfComplaint,
  pastMedHistory,
  familyHistory,
  socialHistory,
  otherHistory,
  generalExam,
  systemicExam,
  reviewOfSystems,
  primaryDiagnosis,
  differentialDiagnosis,
  investigations,
  bedsideTests,
  drugHistoryAllergies,
  problemsList,
  patientEducation,
}) => {
  return (
    <>
      {/* 1. Extended Clinical History */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4 text-docuhealth-dark">
          Clinical History Details
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-[12px] pb-2">
            <h4 className="text-gray-400 font-normal mb-1">
              History of Complaint:
            </h4>
            <p className="font-medium">{historyOfComplaint || "NIL"}</p>
          </div>

          <div className="text-[12px] pb-2">
            <h4 className="text-gray-400 font-normal mb-1">
              Past Medical History:
            </h4>
            <p className="font-medium">{pastMedHistory || "NIL"}</p>
          </div>

          <div className="text-[12px] pb-2">
            <h4 className="text-gray-400 font-normal mb-1">
              Family History:
            </h4>
            <p className="font-medium">{familyHistory || "NIL"}</p>
          </div>

          <div className="text-[12px] pb-2">
            <h4 className="text-gray-400 font-normal mb-1">
              Social History:
            </h4>
            <p className="font-medium">{socialHistory || "NIL"}</p>
          </div>
        </div>

        <div className="text-[12px] pt-2 border-t mt-2">
          <h4 className="text-gray-400 font-normal mb-1">
            Other Relevant History:
          </h4>
          <p className="font-medium">{otherHistory || "NIL"}</p>
        </div>
      </div>

      {/* 2. Physical Examinations & Review */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4">Examination Findings</p>

        <div className="text-[12px] pb-3">
          <h4 className="text-gray-400 font-normal mb-1">
            General Examination:
          </h4>
          {renderListOrString(generalExam)}
        </div>

        <div className="text-[12px] pb-3">
          <h4 className="text-gray-400 font-normal mb-1">
            Systemic Examination:
          </h4>
          {renderListOrString(systemicExam)}
        </div>

        <div className="text-[12px]">
          <h4 className="text-gray-400 font-normal mb-1">
            Review of Systems:
          </h4>
          <p className="font-medium">{reviewOfSystems || "NIL"}</p>
        </div>
      </div>

      {/* 3. Diagnosis & Testing */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4">Diagnosis & Investigations</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="text-[12px]">
            <h4 className="text-gray-400 font-normal mb-1">
              Primary Diagnosis:
            </h4>
            <p className="font-medium text-docuhealth-primary">
              {primaryDiagnosis || "NIL"}
            </p>
          </div>
          <div className="text-[12px]">
            <h4 className="text-gray-400 font-normal mb-1">
              Differential Diagnosis:
            </h4>
            <p className="font-medium">{differentialDiagnosis || "NIL"}</p>
          </div>
        </div>

        <div className="text-[12px] pb-3">
          <h4 className="text-gray-400 font-normal mb-1">
            Investigations Required:
          </h4>
          {renderListOrString(investigations)}
        </div>

        <div className="text-[12px]">
          <h4 className="text-gray-400 font-normal mb-1">Bedside Tests:</h4>
          {renderListOrString(bedsideTests)}
        </div>
      </div>

      {/* 4. Drug History & Allergies */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-medium mb-4">Drug History / Allergies</p>
        <div className="text-[12px]">
          <h4 className="text-gray-400 font-normal mb-1">
            Known Allergies & Sensitivities:
          </h4>
          <div className="font-medium text-red-600 italic">
            {renderListOrString(drugHistoryAllergies)}
          </div>
        </div>
      </div>

      {/* 5. Patient Education & Problems List */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <div className="text-[12px] pb-3">
          <h4 className="text-gray-400 font-normal mb-1">
            Active Problems List:
          </h4>
          {renderListOrString(problemsList)}
        </div>

        <div className="text-[12px] pt-3 border-t">
          <h4 className="text-gray-400 font-normal mb-1">
            Patient Education/Counselling:
          </h4>
          <p className="font-medium">{patientEducation || "NIL"}</p>
        </div>
      </div>
    </>
  );
};

SoapClinicalDetailsCard.propTypes = {
  historyOfComplaint: PropTypes.string,
  pastMedHistory: PropTypes.string,
  familyHistory: PropTypes.string,
  socialHistory: PropTypes.string,
  otherHistory: PropTypes.string,
  generalExam: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  systemicExam: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  reviewOfSystems: PropTypes.string,
  primaryDiagnosis: PropTypes.string,
  differentialDiagnosis: PropTypes.string,
  investigations: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  bedsideTests: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  drugHistoryAllergies: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  problemsList: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  patientEducation: PropTypes.string,
};

export default SoapClinicalDetailsCard;
