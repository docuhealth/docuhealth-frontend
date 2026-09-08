import React from "react";
import Input from "../../../../ui/Input";

const SummaryField = ({ label, value }) => (
  <Input
    label={label}
    readOnly
    value={value || "—"}
    className="bg-gray-50 text-gray-500 text-[13px]"
  />
);

const DischargeAdmissionSummaryStep = ({
  admissionSummary,
  formData,
  onFieldChange,
}) => {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* Read-only admission summary */}
      <div className="border border-gray-200 rounded-xl p-5 lg:p-6">
        <h3 className="font-semibold text-docuhealth-primary mb-5 text-[15px]">
          Admission Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SummaryField label="Full name" value={admissionSummary.fullName} />
          <SummaryField label="Ward placed" value={admissionSummary.wardPlaced} />
          <SummaryField label="Date/time of admission" value={admissionSummary.admissionDateTime} />
          <SummaryField label="Discharge date" value={admissionSummary.dischargeDateTime} />
          <SummaryField label="Length of stay (Days)" value={admissionSummary.lengthOfStay} />
          <SummaryField label="Admitting doctor" value={admissionSummary.admittingDoctor} />
          <SummaryField label="Consultant in-charge" value={admissionSummary.consultantInCharge} />
          <SummaryField label="Admission Diagnosis" value={admissionSummary.admissionDiagnosis} />
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 lg:p-6">
        <h3 className="font-semibold text-docuhealth-primary mb-3 text-[15px]">
          Chief complaint<span className="text-red-500"> *</span>
        </h3>
        <textarea
          value={formData.chief_complaint}
          onChange={(e) => onFieldChange("chief_complaint", e.target.value)}
          placeholder="What the patient originally presented with..."
          rows={3}
          className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary resize-y"
        ></textarea>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 lg:p-6">
        <h3 className="font-semibold text-docuhealth-primary mb-3 text-[15px]">
          Primary diagnosis<span className="text-red-500"> *</span>
        </h3>
        <textarea
          value={formData.primary_diagnosis}
          onChange={(e) => onFieldChange("primary_diagnosis", e.target.value)}
          placeholder="Add text..."
          rows={3}
          className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary resize-y"
        ></textarea>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 lg:p-6">
        <h3 className="font-semibold text-docuhealth-primary mb-3 text-[15px]">
          Secondary diagnosis<span className="text-red-500"> *</span>
        </h3>
        <textarea
          value={formData.secondary_diagnosis}
          onChange={(e) => onFieldChange("secondary_diagnosis", e.target.value)}
          placeholder="Add text..."
          rows={3}
          className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary resize-y"
        ></textarea>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 lg:p-6">
        <h3 className="font-semibold text-docuhealth-primary mb-3 text-[15px]">
          Comorbidities<span className="text-red-500"> *</span>
        </h3>
        <textarea
          value={formData.comorbidities}
          onChange={(e) => onFieldChange("comorbidities", e.target.value)}
          placeholder="Add text..."
          rows={3}
          className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary resize-y"
        ></textarea>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 lg:p-6">
        <h3 className="font-semibold text-docuhealth-primary mb-3 text-[15px]">
          Treatment plan<span className="text-red-500"> *</span>
        </h3>
        <textarea
          value={formData.treatment_plan}
          onChange={(e) => onFieldChange("treatment_plan", e.target.value)}
          placeholder="What was done during this admission — one item per line..."
          rows={4}
          className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary resize-y"
        ></textarea>
      </div>

      <div className="border border-gray-200 rounded-xl p-5 lg:p-6">
        <h3 className="font-semibold text-docuhealth-primary mb-3 text-[15px]">
          Hospital course note<span className="text-red-500"> *</span>
        </h3>
        <textarea
          value={formData.hospital_course_note}
          onChange={(e) => onFieldChange("hospital_course_note", e.target.value)}
          placeholder="Summarize the patient's clinical course during this admission..."
          rows={5}
          className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary resize-y"
        ></textarea>
      </div>
    </div>
  );
};

export default DischargeAdmissionSummaryStep;
