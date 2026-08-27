import React from "react";
import { ArrowLeft } from "lucide-react";

const HandoverNoteDetail = ({ note, onBack }) => {
  return (
    <div className="text-sm ">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 pb-6 w-full border-b border-gray-100 my-6">
        <div
          className="flex justify-start items-center gap-2 cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          <h2 className="text-[15px] font-semibold text-docuhealth-dark">Handover note information</h2>
        </div>
      </div>

      {/* Patient and Provider Information Card */}
      <div className="p-5 mb-6 bg-docuhealth-light-gray border border-gray-100 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-[13px] space-y-1 text-gray-500">
            <h3 className="font-semibold text-docuhealth-dark text-[15px] mb-2">{note.patientName}</h3>
            <p>Patient HIN: {note.hin || "12456********"}</p>
            <p>Age: {note.age || "30 years"}</p>
            <p>Gender: {note.gender || "Male"}</p>
          </div>

          <div className="text-[13px] space-y-1 text-gray-500">
            <p>Name of nurse</p>
            <p className="font-semibold text-docuhealth-dark">{note.nurseName || "Lois David"}</p>
            <p>{note.nurseRole || "Nurse on duty"}</p>
          </div>

          <div className="text-[13px] space-y-1 text-gray-500">
            <p>Provider information:</p>
            <p className="font-semibold text-docuhealth-dark">{note.providerName || "Downtown Medical clinic"}</p>
            <p>Email: {note.providerEmail || "Oamiefa@gmail.com"}</p>
          </div>

          <div className="text-[13px] space-y-1 text-gray-500">
            <p>Date/Time uploaded</p>
            <p className="font-semibold text-docuhealth-dark">{note.uploadDateTime || note.date}</p>
          </div>
        </div>
      </div>

      {/* Handover Note Details Card */}
      <div className="p-5 bg-docuhealth-light-gray border border-gray-100 rounded-xl">
        <h3 className="font-semibold text-docuhealth-dark text-[15px] mb-5">Handover Note</h3>

        <div className="space-y-4">
          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">General patient condition:</p>
            <p className="font-semibold text-docuhealth-dark">{note.generalCondition || "Persistent lower back pain"}</p>
          </div>

          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">Significant event:</p>
            <p className="font-semibold text-docuhealth-dark">{note.significantEvent || "Lumbar Strain (M54.5)"}</p>
          </div>

          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">Medication due:</p>
            <p className="font-semibold text-docuhealth-dark">{note.medicationDue || "Physical therapy, pain management"}</p>
          </div>

          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">Outstanding nursing task:</p>
            <p className="font-semibold text-docuhealth-dark">{note.outstandingTask || "None"}</p>
          </div>

          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">Pending investigations:</p>
            <p className="font-semibold text-docuhealth-dark">{note.pendingInvestigations || "Physical therapy, pain management"}</p>
          </div>

          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">Escalations</p>
            <p className="font-semibold text-docuhealth-dark">{note.escalations || "Physical therapy, pain management"}</p>
          </div>

          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">Recommendations</p>
            <p className="font-semibold text-docuhealth-dark">{note.recommendations || "Physical therapy, pain management"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandoverNoteDetail;
