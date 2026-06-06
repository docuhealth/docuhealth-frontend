import { useNavigate } from "react-router-dom";
import { FlaskConical, Building2, CalendarClock } from "lucide-react";

const getPatientName = (order) => {
  const p = order.patient_info;
  if (p) return `${p.firstname || ""} ${p.lastname || ""}`.trim() || "Unknown";
  return "Unknown";
};

const getHIN = (order) => order.patient_info?.hin || "—";

const getTestName = (order) => order.test_info?.name || "—";

const getHospital = (order) => order.hospital_info?.name || "—";

const getDatetime = (order) => {
  const raw = order.created_at;
  if (!raw) return "—";
  return new Date(raw).toLocaleString("en-US", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const getRequestedBy = (order) => {
  const o = order.ordered_by;
  if (!o) return undefined;
  return `${o.role === "doctor" ? "Dr. " : ""}${o.firstname || ""} ${o.lastname || ""}`.trim();
};

const LabOrderCard = ({ order, badge, activeTab }) => {
  const navigate = useNavigate();

  return (
    <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-[#1B2B40] truncate">
          {getPatientName(order)}
        </p>
        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      <p className="text-xs text-gray-400">HIN: {getHIN(order)}</p>

      <hr className="border-gray-100" />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FlaskConical size={14} className="text-gray-400 shrink-0" />
          <span className="truncate">{getTestName(order)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Building2 size={14} className="text-gray-400 shrink-0" />
          <span className="truncate">{getHospital(order)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <CalendarClock size={14} className="text-gray-400 shrink-0" />
          <span>{getDatetime(order)}</span>
        </div>
      </div>

      <button
        onClick={() =>
          navigate("/hospital-lab-test-detail", {
            state: {
              order: {
                id:          order.sqid,
                name:        getPatientName(order),
                hin:         getHIN(order),
                test:        getTestName(order),
                hospital:    getHospital(order),
                datetime:    getDatetime(order),
                tab:         activeTab,
                requestedBy: getRequestedBy(order),
                gender:      order.patient_info?.gender,
                dob:         order.patient_info?.dob,
                email:       order.hospital_info?.email,
                status:      order.status,
                note:        order.note,
                test_info:   order.test_info,
                result_info: order.result_info,
                rejection_reason: order.rejection_reason,
                specimen_collected_at: order.specimen_collected_at,
              },
            },
          })
        }
        className="mt-1 w-full border border-gray-300 text-xs text-gray-700 py-2 rounded-full hover:bg-gray-50 transition-colors"
      >
        View details
      </button>
    </div>
  );
};

export default LabOrderCard;
