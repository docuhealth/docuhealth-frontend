import { useNavigate } from "react-router-dom";
import { FlaskConical, Building2, CalendarClock } from "lucide-react";

const getPatientName = (order) => {
  const p = order.patient_info;
  if (p) return `${p.firstname || ""} ${p.lastname || ""}`.trim() || "Unknown";
  return "Unknown";
};

const getHIN = (order) => order.patient_info?.hin || "—";

const getTestName = (order) => {
  if (order.items && order.items.length > 0) {
    const names = order.items.map(i => i.test_info?.name).filter(Boolean);
    if (names.length === 1) return names[0];
    return `${names.length} Tests: ${names.join(", ")}`;
  }
  return order.test_info?.name || "—";
};

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
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-100 uppercase">
            {getPatientName(order).charAt(0)}
          </div>
          <div>
             <p className="text-[10px] text-slate-400 uppercase font-bold">
                Patient
             </p>
             <p className="text-sm font-semibold text-slate-800">
                {getPatientName(order)}
             </p>
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-medium">HIN</p>
            <p className="text-[13px] text-slate-600">{getHIN(order)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-medium">Date / Time</p>
            <p className="text-[13px] text-slate-600">{getDatetime(order)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-medium">Test</p>
            <p className="text-[13px] text-slate-600 truncate" title={getTestName(order)}>{getTestName(order)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-medium">Hospital</p>
            <p className="text-[13px] text-slate-600 truncate" title={getHospital(order)}>{getHospital(order)}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() =>
          navigate("/hospital-lab-test-detail", {
            state: {
              order,
              tab: activeTab,
            },
          })
        }
        className="mt-2 w-full border border-docuhealth-primary text-docuhealth-primary text-xs font-medium py-2 rounded-full hover:bg-indigo-50 transition-colors"
      >
        View details
      </button>
    </div>
  );
};

export default LabOrderCard;
