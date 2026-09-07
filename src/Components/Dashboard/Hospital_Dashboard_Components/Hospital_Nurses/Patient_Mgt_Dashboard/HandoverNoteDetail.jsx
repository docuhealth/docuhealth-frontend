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

      {/* Patient and Nurse Information Card */}
      <div className="p-5 mb-6 bg-docuhealth-light-gray border border-gray-100 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-[13px] space-y-1 text-gray-500">
            <h3 className="font-semibold text-docuhealth-dark text-[15px] mb-2">{note.patientName}</h3>
            <p>Patient HIN: <span className="text-gray-700 font-medium">{note.hin || "N/A"}</span></p>
            <p>Age: <span className="text-gray-700 font-medium">{note.age || "N/A"}</span></p>
            <p>Gender: <span className="text-gray-700 font-medium capitalize">{note.gender || "N/A"}</span></p>
          </div>

          <div className="text-[13px] space-y-1 text-gray-500">
            <p className="mb-2 text-xs uppercase font-bold text-gray-400">{note.type === 'received' ? 'From nurse' : 'To nurse'}</p>
            <p className="font-semibold text-docuhealth-dark text-[15px]">{note.nurseName || "Unknown"}</p>
            <p className="text-gray-600 capitalize">{note.nurseSpecialization || note.nurseRole || "Nurse"}</p>
            {note.nurseStaffId && <p className="text-xs text-gray-400">Staff ID: {note.nurseStaffId}</p>}
          </div>

          <div className="text-[13px] space-y-1 text-gray-500">
            <p className="mb-2 text-xs uppercase font-bold text-gray-400">Handover status</p>
            <p className="font-semibold text-docuhealth-dark capitalize">{note.type === 'received' ? 'Received handover' : 'Sent handover'}</p>
          </div>
        </div>
      </div>

      {/* Handover Note Details Card */}
      <div className="p-5 bg-docuhealth-light-gray border border-gray-100 rounded-xl">
        <h3 className="font-semibold text-docuhealth-dark text-[15px] mb-5">Handover details</h3>

        <div className="space-y-4">
          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">General patient condition:</p>
            <p className="font-semibold text-docuhealth-dark">{note.generalCondition || "None"}</p>
          </div>

          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">Significant events:</p>
            <p className="font-semibold text-docuhealth-dark">{note.significantEvent || "None"}</p>
          </div>

          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">Medications due:</p>
            <p className="font-semibold text-docuhealth-dark">{note.medicationDue || "None"}</p>
          </div>

          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">Outstanding nursing tasks:</p>
            <p className="font-semibold text-docuhealth-dark">{note.outstandingTask || "None"}</p>
          </div>

          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">Pending investigations:</p>
            <p className="font-semibold text-docuhealth-dark">{note.pendingInvestigations || "None"}</p>
          </div>

          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">Escalations:</p>
            <p className="font-semibold text-docuhealth-dark">{note.escalations || "None"}</p>
          </div>

          <div className="text-[13px]">
            <p className="text-gray-500 mb-1">Recommendations:</p>
            <p className="font-semibold text-docuhealth-dark">{note.recommendations || "None"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandoverNoteDetail;
