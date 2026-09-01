import React from "react";
import { ArrowLeft } from "lucide-react";

const CarePlanDetail = ({ plan, onBack }) => {
  return (
    <div className="text-sm ">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 pb-6 w-full border-b border-gray-100 my-6">
        <div
          className="flex justify-start items-center gap-2 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          <h2 className="text-[15px] font-semibold text-docuhealth-dark">Care plan information</h2>
        </div>
      </div>

      {/* Patient and Provider Information Card */}
      <div className="p-5 mb-6 bg-docuhealth-light-gray border border-gray-100 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-[13px] space-y-1 text-gray-500">
            <h3 className="font-semibold text-docuhealth-dark text-[15px] mb-2">{plan.patientName || "Patient"}</h3>
            <p>Patient HIN: {plan.hin || "N/A"}</p>
          </div>

          <div className="text-[13px] space-y-1 text-gray-500">
            <p>Name of nurse</p>
            <p className="font-semibold text-docuhealth-dark">{plan.nurseName || "Nurse"}</p>
          </div>

          <div className="text-[13px] space-y-1 text-gray-500">
            <p>Date uploaded</p>
            <p className="font-semibold text-docuhealth-dark">{plan.date || plan.created_at || "N/A"}</p>
          </div>
          
          <div className="text-[13px] space-y-1 text-gray-500">
            <p>Time uploaded</p>
            <p className="font-semibold text-docuhealth-dark">{plan.time || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Care Plan Details Card */}
      <div className="p-5 bg-docuhealth-light-gray border border-gray-100 rounded-xl">
        <h3 className="font-semibold text-docuhealth-dark text-[15px] mb-5">Care Plan</h3>

        <div className="space-y-4">
          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">Problems/Diagnosis:</p>
            <p className="font-semibold text-docuhealth-dark">{plan.problem || "None"}</p>
          </div>

          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">Goals/Objective:</p>
            <p className="font-semibold text-docuhealth-dark">{plan.goals || "None"}</p>
          </div>

          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">Intervention:</p>
            <p className="font-semibold text-docuhealth-dark">{plan.intervention || "None"}</p>
          </div>

          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">Evaluation:</p>
            <p className="font-semibold text-docuhealth-dark">{plan.evaluation || "None"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarePlanDetail;
