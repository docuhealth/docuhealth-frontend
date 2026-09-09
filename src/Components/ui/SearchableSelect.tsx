import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface SearchableSelectOption {
  value: string;
  label: string;
  [key: string]: unknown;
}

export interface SearchableSelectProps {
  value?: string;
  onChange: (value: string, option: SearchableSelectOption) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  isLoading?: boolean;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

// Dropdown with an in-panel search box, used anywhere a select needs to be
// filterable (HMO providers, company partners, specializations, ...). Fully
// self-contained — its open/search state resets for free whenever the
// parent unmounts it. `options` is [{ value, label, ...anythingElse }];
// `onChange(value, option)` hands back the whole option so callers can keep
// the full record (e.g. sqid + name), not just the value.
const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  isLoading = false,
  emptyText = "No options found.",
  disabled = false,
  className = "",
}: SearchableSelectProps) => {
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

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-3 text-sm text-left focus:outline-hidden focus:border-docuhealth-primary ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "cursor-pointer hover:border-docuhealth-primary"
        }`}
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
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-3 text-sm text-gray-400">Loading...</p>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value, option);
                    setIsOpen(false);
                    setSearch("");
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
              <p className="px-4 py-3 text-sm text-gray-400">{emptyText}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
