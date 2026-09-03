import React from "react";
import { Sparkles } from "lucide-react";
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
  onGenerateSummary,
  isGeneratingSummary,
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h3 className="font-semibold text-docuhealth-primary text-[15px] flex items-center gap-1.5">
            <Sparkles size={15} />
            Hospital course note (A.I generated summary)<span className="text-red-500"> *</span>
          </h3>
          <button
            type="button"
            onClick={onGenerateSummary}
            disabled={isGeneratingSummary}
            className="flex items-center gap-1.5 border border-docuhealth-primary text-docuhealth-primary rounded-full px-4 py-1.5 text-[12px] font-medium hover:bg-docuhealth-primary/5 disabled:opacity-60 whitespace-nowrap"
          >
            <Sparkles size={13} />
            {isGeneratingSummary ? "Loading progress note..." : "Generate summary from progress note"}
          </button>
        </div>
        <textarea
          value={formData.hospital_course_note}
          onChange={(e) => onFieldChange("hospital_course_note", e.target.value)}
          placeholder="Click “Generate summary from progress note” to pull in the patient's latest progress note, or type a summary here..."
          rows={5}
          className="w-full bg-white border border-gray-200 rounded-md px-3 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:border-docuhealth-primary resize-y"
        ></textarea>
      </div>
    </div>
  );
};

export default DischargeAdmissionSummaryStep;
