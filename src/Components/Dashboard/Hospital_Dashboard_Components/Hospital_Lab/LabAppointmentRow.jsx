import { useState } from "react";
import { UserIcon, FlaskConical, FileText } from "lucide-react";

const getPatientName = (appt) =>
  appt.patient_name ||
  (appt.patient ? `${appt.patient.firstname || ""} ${appt.patient.lastname || ""}`.trim() : "") ||
  appt.name ||
  "Unknown";

const getTestName = (appt) => appt.test_name || appt.test || "Test request";

const getNote = (appt) => appt.note || appt.doctor_note || appt.description || "—";

const LabAppointmentRow = ({ appt, onOpen, onSeeDetails, onCreateOrder, hideCreateOrder }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4 p-4 border rounded-md flex flex-wrap items-center gap-4 lg:gap-8">
      <div className="flex items-center gap-3 min-w-[140px]">
        <div className="p-2 bg-gray-100 rounded-md shrink-0">
          <UserIcon className="w-4 h-4 text-gray-600" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Patient</p>
          <p className="text-sm font-medium truncate">{getPatientName(appt)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 min-w-[140px]">
        <div className="p-2 bg-gray-100 rounded-md shrink-0">
          <FlaskConical className="w-4 h-4 text-gray-600" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Test Request</p>
          <p className="text-sm font-medium truncate">{getTestName(appt)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-1 min-w-[140px]">
        <div className="p-2 bg-gray-100 rounded-md shrink-0">
          <FileText className="w-4 h-4 text-gray-600" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Note</p>
          <p className="text-sm font-medium truncate">{getNote(appt)}</p>
        </div>
      </div>

      <div className="relative flex items-center justify-end ml-auto shrink-0">
        <div
          onClick={() => setOpen((v) => !v)}
          className={`h-8 w-9 flex justify-center items-center rounded-full cursor-pointer ${
            open ? "bg-slate-300" : "hover:bg-gray-200"
          }`}
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
          </svg>
        </div>

        {open && (
          <div className="absolute top-10 right-0 mt-2 bg-white border shadow-sm rounded-xs p-2 w-52 z-30">
            <p
              className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
              onClick={() => { setOpen(false); onSeeDetails(appt); }}
            >
              See patient's details
            </p>
            {!hideCreateOrder && (
              <p
                className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                onClick={() => { setOpen(false); onCreateOrder(appt); }}
              >
                Create an order
              </p>
            )}
            <p className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer">
              Mark as done
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabAppointmentRow;
