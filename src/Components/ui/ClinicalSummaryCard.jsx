import React from "react";
import PropTypes from "prop-types";
import { renderLabTests, renderDrugRecords } from "../../utils/soapNoteHelpers";

const ClinicalSummaryCard = ({ selectedMedicalRecord }) => {
  if (!selectedMedicalRecord) return null;

  return (
    <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl">
      <p className="font-medium mb-4">Clinical Summary</p>
      <div className="pb-1">
        <p className="text-[12px]">
          {" "}
          Chief complaint :{" "}
          <span className="font-medium ">
            {" "}
            {selectedMedicalRecord.chief_complaint || "NIL"}
          </span>
        </p>
      </div>
      <div className="text-[12px] pb-1">
        <p>History summary :</p>
        <ul className="list-disc list-outside pl-5 font-medium">
          {(selectedMedicalRecord?.history || []).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="text-[12px] pb-1">
        <p>Diagnosis:</p>
        <ul className="list-disc list-outside pl-5 font-medium">
          {(selectedMedicalRecord?.diagnosis || []).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="text-[12px] pb-1">
        <p>Treatment plan:</p>
        <ul className="list-disc list-outside pl-5 font-medium">
          {(selectedMedicalRecord?.treatment_plan || []).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="text-[12px] pb-1">
        <p>Care instructions:</p>
        <ul className="list-disc list-outside pl-5 font-medium">
          {(selectedMedicalRecord?.care_instructions || []).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="text-[12px] pb-1">
        <p>Physical examinations:</p>
        <ul className="list-disc list-outside pl-5 font-medium">
          {(selectedMedicalRecord?.physical_exam || []).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="text-[12px] ">
        {renderDrugRecords(
          selectedMedicalRecord?.drug_orders_info ||
            selectedMedicalRecord?.drug_records
        )}
      </div>
      <div className="text-[12px] pb-1 mt-6">
        {renderLabTests(
          selectedMedicalRecord?.lab_tests_info ||
            selectedMedicalRecord?.lab_tests
        )}
      </div>
    </div>
  );
};

ClinicalSummaryCard.propTypes = {
  selectedMedicalRecord: PropTypes.object,
};

export default ClinicalSummaryCard;
