import React from "react";
import { CheckCircle2, Clock3 } from "lucide-react";
import { RESULT_FILTERS } from "./scanLabResults";

const TONES = {
  awaiting: { icon: Clock3, iconClass: "text-amber-500", chipActive: "bg-amber-100 text-amber-700" },
  approved: { icon: CheckCircle2, iconClass: "text-docuhealth-green", chipActive: "bg-green-100 text-green-700" },
};

// Awaiting approval / Approved switch shared by the doctor's Scan and Lab result tabs
const ResultFilterTabs = ({ value, onChange, counts, loading }) => (
  <div role="tablist" aria-label="Filter results" className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
    {RESULT_FILTERS.map((filter) => {
      const active = value === filter.key;
      const { icon: Icon, iconClass, chipActive } = TONES[filter.key];
      return (
        <button
          key={filter.key}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(filter.key)}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap cursor-pointer transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-docuhealth-primary/40 ${
            active ? "bg-white text-gray-900 font-semibold shadow-sm ring-1 ring-gray-200" : "text-gray-500 font-medium hover:text-gray-800"
          }`}
        >
          <Icon size={14} className={active ? iconClass : "text-gray-400"} />
          {filter.label}
          <span
            className={`min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${
              active ? chipActive : "bg-gray-200 text-gray-600"
            }`}
          >
            {loading ? "–" : counts?.[filter.key] ?? 0}
          </span>
        </button>
      );
    })}
  </div>
);

export default ResultFilterTabs;
