import { ScanLine, Building2, CalendarClock } from "lucide-react";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";

// Structure, sizing (text-[12px] throughout) and spacing rhythm mirror the
// "admitted patient" card on the doctor's Patient Mgt dashboard
// (Hospital_Doctors_Patients_Dashboard -> TabDetails.jsx AdmittedPatientsTab)
// for visual consistency across departments — only the badge is
// status-colored instead of always green.

const getPatientName = (order) => {
  const p = order.patient_info;
  if (p) return `${p.firstname || ""} ${p.lastname || ""}`.trim() || "Unknown";
  return "Unknown";
};

// First 2 and last 2 digits visible, everything between masked.
const maskHIN = (hin) => {
  if (!hin) return "—";
  return hin.length > 4 ? `${hin.slice(0, 2)}${"*".repeat(hin.length - 4)}${hin.slice(-2)}` : hin;
};

const ScanRequestCard = ({ order, badge, onViewDetails }) => {
  return (
    <div className="border p-3 rounded-xl text-[12px]">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-gray-900">{getPatientName(order)}</p>
        <div className={`${badge.cls} px-2 rounded-full`}>
          <p>{badge.label}</p>
        </div>
      </div>

      <div className="border-b py-2">
        <p className="text-gray-600">HIN:{maskHIN(order.patient_info?.hin)}</p>
      </div>

      <div className="flex items-center gap-1 text-gray-600 pt-3">
        <ScanLine size={15} className="text-docuhealth-dark shrink-0" />
        <p>{order.scan_type}</p>
      </div>
      <div className="flex items-center gap-1 text-gray-600 pt-1">
        <Building2 size={15} className="text-docuhealth-dark shrink-0" />
        <p>{order.hospital_info?.name || "—"}</p>
      </div>
      <div className="flex items-center gap-1 text-gray-600 pt-1 pb-3 border-b">
        <CalendarClock size={15} className="text-docuhealth-dark shrink-0" />
        <p>{formatFullDateTime(order.created_at) || "—"}</p>
      </div>

      <button
        onClick={onViewDetails}
        className="text-center mt-3 py-2.5 border bg-docuhealth-dark text-white w-full rounded-full cursor-pointer"
      >
        View details
      </button>
    </div>
  );
};

export default ScanRequestCard;
