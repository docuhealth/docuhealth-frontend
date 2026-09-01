import React, { useContext } from "react";
import toast from "react-hot-toast";
import { Printer, Download } from "lucide-react";
import {
  formatFullDateTime,
  getAge,
} from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { DoctorAppContext } from "../../../../../context/HospitalContext/Doctors/DoctorAppContext";
import { HANDOVER_FIELDS } from "./AddHandoverNoteForm";

const maskHin = (hin) => {
  if (!hin) return "NIL";
  if (hin.length <= 6) return hin;
  return `${hin.slice(0, 5)}${"*".repeat(Math.max(0, hin.length - 7))}${hin.slice(-2)}`;
};

/**
 * Full-page "Handover note information" view — same shell as the other
 * per-tab detail pages (see PatientMedicalRecordDetail.jsx / the nurses'
 * CaseNoteDetail.jsx): back arrow swaps the tab content back to the list,
 * it isn't a modal.
 */
const HandoverNoteDetailPage = ({
  note,
  onBack,
  patientLabel,
  patientFullInfo,
  selected,
}) => {
  const { profile, hospitalName } = useContext(DoctorAppContext);

  if (!note) return null;

  const patientInfo =
    patientFullInfo?.patient_info || selected?.patient_info || {};
  const hin = patientInfo?.hin || selected?.patient?.hin;
  const doctorName =
    [profile?.firstname, profile?.lastname].filter(Boolean).join(" ") || "—";

  const handlePrint = () => window.print();
  const handleDownload = () =>
    toast(
      "Downloading as PDF isn't wired up yet — this is a UI preview for now.",
      { icon: "🛠️" },
    );

  return (
    <div className="bg-white my-5 border rounded-lg pt-5 lg:pt-8 px-4 lg:px-6 pb-8 text-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 border-b pb-4 w-full">
        <button
          type="button"
          className="flex justify-start items-center gap-1 cursor-pointer"
          onClick={onBack}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.56528 6.41685H11.6654V7.58352H4.56528L7.69426 10.7125L6.86932 11.5374L2.33203 7.00019L6.86932 2.46289L7.69426 3.28785L4.56528 6.41685Z"
              fill="var(--color-docuhealth-dark)"
            />
          </svg>
          <span className="text-sm">Handover note information</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 border border-gray-300 py-1.5 px-4 rounded-full w-full sm:w-auto text-docuhealth-dark hover:bg-gray-50 transition-colors"
          >
            <Printer size={14} />
            <p>Print case note</p>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 border border-gray-300 py-1.5 px-4 rounded-full w-full sm:w-auto text-docuhealth-dark hover:bg-gray-50 transition-colors"
          >
            <Download size={14} />
            <p>Download PDF</p>
          </button>
        </div>
      </div>

      {/* Identity summary */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <p className="font-semibold text-docuhealth-dark mb-2">
              {patientLabel}
            </p>
            <p className="text-[12px] text-gray-600">
              Patient HIN: {maskHin(hin)}
            </p>
            <p className="text-[12px] text-gray-600">
              Age: {getAge(patientInfo?.dob) || "NIL"}
            </p>
            <p className="text-[12px] text-gray-600 capitalize">
              Gender: {patientInfo?.gender || "NIL"}
            </p>
          </div>

          <div>
            <p className="text-[12px] text-gray-500">Name of doctor</p>
            <p className="font-medium text-docuhealth-dark mb-1">
              {doctorName}
            </p>
            <p className="text-[12px] text-gray-500 mb-2">Doctor on duty</p>
          </div>

          <div>
            <p className="text-[12px] text-gray-500">Handed over to</p>
            <p className="font-medium text-docuhealth-dark">
              {note.handed_over_to || "NIL"}
            </p>
          </div>

          <div>
            <p className="text-[12px] text-gray-500">Provider information:</p>
            <p className="font-medium text-docuhealth-dark mb-1">
              {hospitalName || "NIL"}
            </p>
            <p className="text-[12px] text-gray-500">
              Email: {profile?.email || "NIL"}
            </p>
          </div>

          <div>
            <p className="text-[12px] text-gray-500">Date/Time uploaded</p>
            <p className="font-medium text-docuhealth-dark">
              {formatFullDateTime(note.created_at) || "NIL"}
            </p>
          </div>
        </div>
      </div>

      {/* Handover note */}
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="font-semibold text-docuhealth-dark mb-4">Handover Note</p>
        <div className="space-y-4">
          {HANDOVER_FIELDS.map((field) => (
            <div key={field.key} className="text-[13px]">
              <p className="text-gray-500 mb-1">{field.label}</p>
              <p className="font-medium text-docuhealth-dark whitespace-pre-wrap">
                {note[field.key]?.trim() ? note[field.key] : "None"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HandoverNoteDetailPage;
