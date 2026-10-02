import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export interface MultiSelectOption {
  value: string;
  label: string;
  [key: string]: unknown;
}

export interface MultiSelectProps {
  values: string[];
  onChange: (values: string[], options: MultiSelectOption[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  label?: string;
  // Shows a red "*" after the label. Visual only.
  required?: boolean;
  error?: string;
  isLoading?: boolean;
  emptyText?: string;
  disabled?: boolean;
  // Defaults to showing the search box once there are more than 5 options.
  searchable?: boolean;
  // Renders the picked options as removable chips under the trigger.
  showChips?: boolean;
  className?: string;
}

// Multi-pick sibling of Select / SearchableSelect: same trigger + panel look,
// but options toggle via checkboxes and the panel stays open between picks.
// `onChange(values, options)` hands back the full picked options too.
const MultiSelect = ({
  values,
  onChange,
  options,
  placeholder = "Select options",
  label,
  required = false,
  error,
  isLoading = false,
  emptyText = "No options found.",
  disabled = false,
  searchable,
  showChips = true,
  className = "",
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
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

  const showSearch = searchable ?? options.length > 5;
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const emit = (nextValues: string[]) => {
    onChange(
      nextValues,
      options.filter((option) => nextValues.includes(option.value))
    );
  };

  const toggle = (value: string) => {
    emit(
      values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value]
    );
  };

  const triggerText = isLoading
    ? "Loading..."
    : values.length > 0
      ? `${values.length} selected`
      : placeholder;

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      {label && (
        <p className="font-semibold pb-1 whitespace-nowrap">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </p>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between border rounded-lg px-3 py-3 text-sm text-left focus:outline-hidden focus:border-docuhealth-primary ${
            disabled
              ? "bg-gray-100 cursor-not-allowed border-gray-300"
              : "cursor-pointer hover:border-docuhealth-primary"
          } ${error ? "border-red-500 focus:border-red-500" : "border-gray-300"}`}
        >
          <span className={values.length > 0 && !isLoading ? "" : "text-gray-400"}>
            {triggerText}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && !disabled && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            {showSearch && (
              <div className="relative p-2 border-b border-gray-100">
                <Search className="w-4 h-4 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-2 py-2 text-sm border border-gray-200 rounded-md focus:outline-hidden focus:border-docuhealth-primary"
                />
              </div>
            )}
            <div className="max-h-56 overflow-y-auto" role="listbox" aria-multiselectable="true">
              {isLoading ? (
                <p className="px-4 py-3 text-sm text-gray-400">Loading...</p>
              ) : filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = values.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-docuhealth-primary/10 text-docuhealth-primary font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(option.value)}
                        className="w-4 h-4 accent-docuhealth-primary cursor-pointer"
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })
              ) : (
                <p className="px-4 py-3 text-sm text-gray-400">{emptyText}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {showChips && values.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {values.map((value) => {
            const optionLabel =
              options.find((option) => option.value === value)?.label ?? value;
            return (
              <span
                key={value}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700"
              >
                <span className="truncate max-w-[200px]">{optionLabel}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => emit(values.filter((v) => v !== value))}
                    className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                    aria-label={`Remove ${optionLabel}`}
                  >
                    <X size={14} />
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

MultiSelect.displayName = "MultiSelect";

export default MultiSelect;
