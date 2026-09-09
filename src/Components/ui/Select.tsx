import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  [key: string]: unknown;
}

export interface SelectProps {
  value?: string;
  onChange: (value: string, option: SelectOption) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  /** Shows a red "*" after the label. Visual only. */
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// Same button-trigger + option-panel look as SearchableSelect, minus the
// search box — for option lists short enough that filtering is overkill
// (gender, roles, wards, ...). Keep the two in sync visually.
const Select = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  label,
  required = false,
  error,
  disabled = false,
  className = "",
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      {label && (
        <p className="font-semibold pb-1 whitespace-nowrap">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </p>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between border rounded-lg px-3 py-3 text-sm text-left focus:outline-hidden focus:border-docuhealth-primary ${
          disabled
            ? "bg-gray-100 cursor-not-allowed border-gray-300"
            : "cursor-pointer hover:border-docuhealth-primary"
        } ${error ? "border-red-500 focus:border-red-500" : "border-gray-300"}`}
      >
        <span className={selectedLabel ? "" : "text-gray-400"}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            {options.length > 0 ? (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value, option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                    option.value === value
                      ? "bg-docuhealth-primary/10 text-docuhealth-primary font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-gray-400">No options found.</p>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

Select.displayName = "Select";

export default Select;
