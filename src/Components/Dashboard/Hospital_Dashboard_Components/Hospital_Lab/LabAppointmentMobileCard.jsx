const getPatientName = (appt) =>
  appt.patient_name ||
  (appt.patient ? `${appt.patient.firstname || ""} ${appt.patient.lastname || ""}`.trim() : "") ||
  appt.name ||
  "Unknown";

const getTestName = (appt) => appt.test_name || appt.test || "Test request";

const getNote = (appt) => appt.note || appt.doctor_note || appt.description || "—";

const initials = (name) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase();

const LabAppointmentMobileCard = ({ appt, onOpen }) => {
  const name = getPatientName(appt);

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-50 mb-3">
        <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100">
          {initials(name)}
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-medium">Patient</p>
          <p className="text-[13px] font-semibold text-gray-800">{name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-1 mb-4">
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-medium">Test Request</p>
          <p className="text-[13px] text-gray-600">{getTestName(appt)}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-medium">Note</p>
          <p className="text-[13px] text-gray-600 truncate italic">&ldquo;{getNote(appt)}&rdquo;</p>
        </div>
      </div>

      <button
        className="w-full bg-white border border-[#3E4095] text-[#3E4095] rounded-full py-2.5 text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 active:bg-blue-100 transition-colors"
        onClick={() => onOpen(appt)}
      >
        Open
      </button>
    </div>
  );
};

export default LabAppointmentMobileCard;
