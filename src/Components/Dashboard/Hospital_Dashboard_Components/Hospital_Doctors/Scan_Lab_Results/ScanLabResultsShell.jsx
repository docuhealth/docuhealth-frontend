import React, { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import DynamicDate from "../../../../DynamicDate/DynamicDate";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";
import { RESULT_TABS } from "./scanLabResults";

const SORT_OPTIONS = [
  { value: "-created_at", label: "Sort by: Latest" },
  { value: "created_at", label: "Sort by: Oldest" },
];

// Frame shared by both tabs of the doctor's Scan/Lab results page; each tab supplies its own data and card grid.
const ScanLabResultsShell = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  ordering,
  onOrderingChange,
  count,
  currentPage,
  totalPages,
  setCurrentPage,
  children,
}) => {
  const [searchOpen, setSearchOpen] = useState(Boolean(searchQuery));

  // Closing the box also clears it so a hidden filter never keeps narrowing the list.
  const toggleSearch = () => {
    if (searchOpen) onSearchChange("");
    setSearchOpen((open) => !open);
  };

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
        <div className="flex border-b border-gray-200 mb-5 overflow-x-auto">
          {RESULT_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`text-sm px-4 py-2 font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer border-b-2 ${
                activeTab === tab.key
                  ? "text-docuhealth-primary border-docuhealth-primary font-semibold"
                  : "text-gray-600 border-transparent hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3 mb-6">
          {searchOpen && (
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="min-w-0 flex-1 sm:flex-none sm:w-64 border border-gray-200 bg-gray-50 rounded-full px-4 py-2 text-xs text-gray-700 outline-none focus:border-docuhealth-primary"
            />
          )}
          <button
            type="button"
            onClick={toggleSearch}
            aria-label={searchOpen ? "Close search" : "Search"}
            className="h-9 w-9 shrink-0 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {searchOpen ? <X size={16} /> : <Search size={16} />}
          </button>

          <div className="relative inline-block shrink-0">
            <select
              value={ordering}
              onChange={(e) => onOrderingChange(e.target.value)}
              className="border border-docuhealth-primary text-docuhealth-primary text-xs font-medium pl-4 pr-10 py-2 rounded-full hover:bg-indigo-50 transition-colors whitespace-nowrap appearance-none outline-none cursor-pointer bg-transparent"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-docuhealth-primary pointer-events-none" />
          </div>
        </div>

        {children}

        <Pagination2 count={count} currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      </div>
    </>
  );
};

export default ScanLabResultsShell;
