import { useState } from "react";

const getPatientName = (appt) =>
  appt.patient_name ||
  (appt.patient ? `${appt.patient.firstname || ""} ${appt.patient.lastname || ""}`.trim() : "") ||
  appt.name ||
  "Unknown";

const getTestName = (appt) => appt.test_name || appt.test || "Test request";

const getNote = (appt) => appt.note || appt.doctor_note || appt.description || "—";

const initials = (name) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase();

const LabAppointmentMobileCard = ({ appt, onOpen, onSeeDetails, onCreateOrder, hideCreateOrder }) => {
  const [open, setOpen] = useState(false);
  const name = getPatientName(appt);

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-50 mb-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100">
            {initials(name)}
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium">Patient</p>
            <p className="text-[13px] font-semibold text-gray-800">{name}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className={`h-9 w-9 flex items-center justify-center rounded-full ${open ? "bg-slate-200" : "bg-gray-50"}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M14 8C14 7.45 13.55 7 13 7C12.45 7 12 7.45 12 8C12 8.55 12.45 9 13 9C13.55 9 14 8.55 14 8ZM4 8C4 7.45 3.55 7 3 7C2.45 7 2 7.45 2 8C2 8.55 2.45 9 3 9C3.55 9 4 8.55 4 8ZM9 8C9 7.45 8.55 7 8 7C7.45 7 7 7.45 7 8C7 8.55 7.45 9 8 9C8.55 9 9 8.55 9 8Z"
                fill="#1A263E"
              />
            </svg>
          </button>
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
                  Create a test order
                </p>
              )}
              <p className="text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer">
                Mark as done
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-1">
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-medium">Test Request</p>
          <p className="text-[13px] text-gray-600">{getTestName(appt)}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-medium">Note</p>
          <p className="text-[13px] text-gray-600 truncate italic">&ldquo;{getNote(appt)}&rdquo;</p>
        </div>
      </div>
    </div>
  );
};

export default LabAppointmentMobileCard;
