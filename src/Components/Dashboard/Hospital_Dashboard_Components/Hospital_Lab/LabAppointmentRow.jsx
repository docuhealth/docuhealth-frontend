import { UserIcon, FlaskConical, FileText } from "lucide-react";

const getPatientName = (appt) =>
  appt.patient_name ||
  (appt.patient ? `${appt.patient.firstname || ""} ${appt.patient.lastname || ""}`.trim() : "") ||
  appt.name ||
  "Unknown";

const getTestName = (appt) => appt.test_name || appt.test || "Test request";

const getNote = (appt) => appt.note || appt.doctor_note || appt.description || "—";

const LabAppointmentRow = ({ appt, onOpen }) => (
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

    <button
      className="border border-[#3E4095] rounded-full py-2 px-5 w-full lg:w-auto hover:bg-blue-50 transition-all duration-300 cursor-pointer shrink-0"
      onClick={() => onOpen(appt)}
    >
      <p className="text-[#3E4095]">Open</p>
    </button>
  </div>
);

export default LabAppointmentRow;
