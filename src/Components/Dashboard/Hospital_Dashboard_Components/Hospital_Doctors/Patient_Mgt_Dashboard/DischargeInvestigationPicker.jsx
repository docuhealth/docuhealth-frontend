import React from "react";
import { X } from "lucide-react";
import Select from "../../../../ui/Select";

// Shared multi-select: a dropdown of investigation options that get added as
// removable tags below it. Used for both "completed investigations" (step 2)
// and "pending results/investigations" (step 3) of the discharge wizard.
// `options`/`selected` use the shared Select's {value, label} option shape.
const DischargeInvestigationPicker = ({ label, placeholder, options, selected, onToggle }) => (
  <div>
    <label className="block text-[13px] font-medium text-gray-700 mb-2">{label}</label>
    <Select
      value=""
      onChange={(_, option) => onToggle(option)}
      options={options.filter((o) => !selected.some((s) => s.value === o.value))}
      placeholder={placeholder}
    />
    {selected.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-3">
        {selected.map((item) => (
          <span
            key={item.value}
            className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-[12px] text-gray-700"
          >
            {item.label}
            <button type="button" onClick={() => onToggle(item)} className="text-gray-400 hover:text-red-500">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
    )}
  </div>
);

export default DischargeInvestigationPicker;
