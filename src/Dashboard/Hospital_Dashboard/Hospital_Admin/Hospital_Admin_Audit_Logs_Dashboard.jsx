import { useState } from "react";
import AuditLogsView from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/AuditLogsView";

const TABS = [
  { type: "laboratory", label: "Laboratory" },
  { type: "radiology", label: "Radiology" },
];

// Hospital admin: result download history for both departments
const Hospital_Admin_Audit_Logs_Dashboard = () => {
  const [type, setType] = useState("laboratory");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-800">Audit logs</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          See who downloaded lab results and scan reports in your hospital, and when.
        </p>
      </div>

      {/* Same underline tabs as the lab requests page */}
      <div role="tablist" className="flex border-b border-gray-200">
        {TABS.map(({ type: t, label }) => (
          <button
            key={t}
            role="tab"
            aria-selected={type === t}
            onClick={() => setType(t)}
            className={`text-sm px-4 py-2 font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap border-b-2 -mb-px outline-none focus-visible:ring-2 focus-visible:ring-docuhealth-primary/40 rounded-t ${
              type === t
                ? "text-docuhealth-primary border-docuhealth-primary font-semibold"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* key resets paging and search when switching department */}
      <AuditLogsView key={type} type={type} />
    </div>
  );
};

export default Hospital_Admin_Audit_Logs_Dashboard;
