import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Search, ChevronDown, X, History, User, Clock } from "lucide-react";
import Pagination2 from "../../Patient_Dashboard_Components/Pagination/Pagination2";

const MOCK_AUDIT_LOGS = [
  {
    id: 1,
    dateTime: "7/7/2026, 8:50 AM",
    adminName: "Adeleke Francis (admin)",
    testName: "LOINC 3276-7",
    fieldChanged: "Critical low",
    oldValue: "< 0.05 mIU/L",
    newValue: "< 0.01 mIU/L",
  },
  {
    id: 2,
    dateTime: "7/7/2026, 8:50 AM",
    adminName: "Adeleke Francis (admin)",
    testName: "LOINC 3276-7",
    fieldChanged: "Critical low",
    oldValue: "< 0.05 mIU/L",
    newValue: "< 0.01 mIU/L",
  },
  {
    id: 3,
    dateTime: "7/7/2026, 8:50 AM",
    adminName: "Adeleke Francis (admin)",
    testName: "LOINC 3276-7",
    fieldChanged: "Critical low",
    oldValue: "< 0.05 mIU/L",
    newValue: "< 0.01 mIU/L",
  },
  {
    id: 4,
    dateTime: "7/7/2026, 8:50 AM",
    adminName: "Adeleke Francis (admin)",
    testName: "LOINC 3276-7",
    fieldChanged: "Critical low",
    oldValue: "< 0.05 mIU/L",
    newValue: "< 0.01 mIU/L",
  },
  {
    id: 5,
    dateTime: "7/7/2026, 8:50 AM",
    adminName: "Adeleke Francis (admin)",
    testName: "LOINC 3276-7",
    fieldChanged: "Critical low",
    oldValue: "< 0.05 mIU/L",
    newValue: "< 0.01 mIU/L",
  },
  {
    id: 6,
    dateTime: "7/7/2026, 8:50 AM",
    adminName: "Adeleke Francis (admin)",
    testName: "LOINC 3276-7",
    fieldChanged: "Critical low",
    oldValue: "< 0.05 mIU/L",
    newValue: "< 0.01 mIU/L",
  },
  {
    id: 7,
    dateTime: "7/7/2026, 8:50 AM",
    adminName: "Adeleke Francis (admin)",
    testName: "LOINC 3276-7",
    fieldChanged: "Critical low",
    oldValue: "< 0.05 mIU/L",
    newValue: "< 0.01 mIU/L",
  },
  {
    id: 8,
    dateTime: "7/7/2026, 8:50 AM",
    adminName: "Adeleke Francis (admin)",
    testName: "LOINC 3276-7",
    fieldChanged: "Critical low",
    oldValue: "< 0.05 mIU/L",
    newValue: "< 0.01 mIU/L",
  },
  {
    id: 9,
    dateTime: "7/6/2026, 3:15 PM",
    adminName: "Dr. Sarah Jenkins",
    testName: "718-8 Haemoglobin",
    fieldChanged: "Reference range",
    oldValue: "0.2 - 3.5 g/dL",
    newValue: "0.4 - 4.0 g/dL",
  },
  {
    id: 10,
    dateTime: "7/5/2026, 11:20 AM",
    adminName: "Adeleke Francis (admin)",
    testName: "2345-7 Glucose in Blood",
    fieldChanged: "Turnaround time (TAT)",
    oldValue: "2 Days",
    newValue: "4 Hours",
  },
  {
    id: 11,
    dateTime: "7/4/2026, 9:00 AM",
    adminName: "Admin Lab Lead",
    testName: "2093-3 Cholesterol",
    fieldChanged: "Decimal precision",
    oldValue: "1 decimal place",
    newValue: "2 decimal places",
  },
  {
    id: 12,
    dateTime: "7/3/2026, 4:45 PM",
    adminName: "Adeleke Francis (admin)",
    testName: "4548-4 HbA1c in Blood",
    fieldChanged: "Critical high",
    oldValue: "> 12.0 %",
    newValue: "> 10.0 %",
  },
  {
    id: 13,
    dateTime: "7/2/2026, 2:30 PM",
    adminName: "Dr. Sarah Jenkins",
    testName: "2160-0 Creatinine",
    fieldChanged: "Unit of measurement",
    oldValue: "μmol/L",
    newValue: "mg/dL",
  },
  {
    id: 14,
    dateTime: "7/1/2026, 10:10 AM",
    adminName: "Adeleke Francis (admin)",
    testName: "2951-2 Sodium in Serum",
    fieldChanged: "Approval requirement",
    oldValue: "Disabled",
    newValue: "Enabled",
  },
  {
    id: 15,
    dateTime: "6/29/2026, 1:20 PM",
    adminName: "Admin Lab Lead",
    testName: "14804-9 Electrolytes Panel",
    fieldChanged: "Turnaround time (TAT)",
    oldValue: "1 Day",
    newValue: "6 Hours",
  },
  {
    id: 16,
    dateTime: "6/28/2026, 11:05 AM",
    adminName: "Adeleke Francis (admin)",
    testName: "3016-3 TSH in Serum",
    fieldChanged: "Critical high",
    oldValue: "> 50.0 μIU/mL",
    newValue: "> 100.0 μIU/mL",
  },
];

const TEST_FILTERS = [
  "All test",
  "LOINC 3276-7",
  "718-8 Haemoglobin",
  "2345-7 Glucose in Blood",
  "2093-3 Cholesterol",
  "4548-4 HbA1c in Blood",
  "2160-0 Creatinine",
  "2951-2 Sodium in Serum",
];

const getInitials = (name) => {
  if (!name) return "AD";
  const clean = name.replace(/\(admin\)/i, "").replace(/Dr\./i, "").trim();
  const parts = clean.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0]?.slice(0, 2).toUpperCase() || "AD";
};

const getFieldBadge = (field) => {
  const lower = field?.toLowerCase() || "";
  if (lower.includes("critical")) return "bg-amber-50 text-amber-700 border-amber-200/80";
  if (lower.includes("reference")) return "bg-sky-50 text-sky-700 border-sky-200/80";
  if (lower.includes("tat") || lower.includes("turnaround")) return "bg-purple-50 text-purple-700 border-purple-200/80";
  if (lower.includes("unit")) return "bg-blue-50 text-blue-700 border-blue-200/80";
  if (lower.includes("decimal")) return "bg-teal-50 text-teal-700 border-teal-200/80";
  if (lower.includes("approval")) return "bg-violet-50 text-violet-700 border-violet-200/80";
  return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
};

const AuditLogsView = ({ onBack }) => {
  const [logs, setLogs] = useState(MOCK_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All test");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const searchInputRef = useRef(null);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesFilter =
      selectedFilter === "All test" ||
      log.testName.toLowerCase().includes(selectedFilter.toLowerCase());

    const matchesSearch =
      searchQuery.trim() === "" ||
      log.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.fieldChanged.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.oldValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.newValue.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-xs">
      {/* Top Header Row with Back Button and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2.5 text-slate-800 hover:text-docuhealth-primary font-semibold text-base sm:text-lg tracking-tight transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Audit logs</span>
        </button>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Search Toggle / Input */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 w-48 sm:w-64 transition-all">
                <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search logs..."
                  className="bg-transparent border-none outline-none text-xs sm:text-sm text-gray-700 w-full placeholder:text-gray-400"
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-9 h-9 rounded-full bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-100 flex items-center justify-center text-gray-600 hover:text-docuhealth-primary transition-colors cursor-pointer"
                title="Search audit logs"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Test Filter Dropdown */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full border border-docuhealth-primary text-docuhealth-primary hover:bg-indigo-50 transition-colors text-xs sm:text-sm font-medium cursor-pointer"
            >
              <span>Filter: {selectedFilter}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isFilterDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1.5 text-xs sm:text-sm max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                {TEST_FILTERS.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSelectedFilter(item);
                      setIsFilterDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors cursor-pointer ${
                      selectedFilter === item
                        ? "text-docuhealth-primary font-semibold bg-indigo-50/60"
                        : "text-gray-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subheading */}
      <div className="pt-5 pb-3">
        <h3 className="text-sm font-semibold text-slate-700">Audit logs</h3>
      </div>

      {/* Desktop / Tablet Table View */}
      <div className="hidden md:block overflow-x-auto">
        {/* Table Header Pill */}
        <div className="bg-[#F8F9FB] border border-gray-100/80 rounded-full px-6 py-3.5 grid grid-cols-12 items-center text-xs font-semibold text-slate-600 select-none">
          <div className="col-span-2">Date & Time of edit</div>
          <div className="col-span-2">Admin name</div>
          <div className="col-span-2">Test name</div>
          <div className="col-span-2">Field changed</div>
          <div className="col-span-2">Old value</div>
          <div className="col-span-2">New value</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-100 mt-1">
          {currentLogs.length > 0 ? (
            currentLogs.map((log) => (
              <div
                key={log.id}
                className="px-6 py-4 grid grid-cols-12 items-center text-xs sm:text-sm hover:bg-indigo-50/20 transition-colors rounded-xl"
              >
                {/* Date & Time */}
                <div className="col-span-2 text-slate-600 font-medium text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{log.dateTime}</span>
                </div>

                {/* Admin Name with Avatar */}
                <div className="col-span-2 flex items-center gap-2 pr-2">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 text-docuhealth-primary font-bold text-[10px] flex items-center justify-center shrink-0 border border-indigo-200/60 shadow-2xs">
                    {getInitials(log.adminName)}
                  </span>
                  <span className="text-slate-800 font-medium truncate text-xs" title={log.adminName}>
                    {log.adminName}
                  </span>
                </div>

                {/* Test Name Badge */}
                <div className="col-span-2 pr-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-50 text-docuhealth-primary font-mono text-xs font-semibold border border-indigo-100/70 truncate max-w-full" title={log.testName}>
                    {log.testName}
                  </span>
                </div>

                {/* Field Changed Badge */}
                <div className="col-span-2 pr-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getFieldBadge(log.fieldChanged)}`}>
                    {log.fieldChanged}
                  </span>
                </div>

                {/* Old Value Badge */}
                <div className="col-span-2 pr-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 text-xs font-medium line-through opacity-85 truncate max-w-full" title={log.oldValue}>
                    {log.oldValue}
                  </span>
                </div>

                {/* New Value Badge */}
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold truncate max-w-full" title={log.newValue}>
                    {log.newValue}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">
              No audit logs matching your search/filter criteria.
            </div>
          )}
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="block md:hidden space-y-3 mt-2">
        {currentLogs.length > 0 ? (
          currentLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white border border-slate-200/90 hover:border-indigo-200 rounded-2xl p-4 shadow-xs transition-all"
            >
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-gray-100">
                <div className="space-y-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-docuhealth-primary rounded-md border border-indigo-100/70 font-mono">
                    {log.testName}
                  </span>
                  <div className="pt-0.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getFieldBadge(log.fieldChanged)}`}>
                      {log.fieldChanged}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-gray-400 whitespace-nowrap flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  {log.dateTime}
                </span>
              </div>

              <div className="pt-2 text-xs space-y-2">
                <div className="text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 text-docuhealth-primary font-bold text-[9px] flex items-center justify-center shrink-0 border border-indigo-200/60">
                    {getInitials(log.adminName)}
                  </span>
                  <span className="font-medium text-slate-800">{log.adminName}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/80 text-xs font-medium line-through opacity-85">
                    {log.oldValue}
                  </span>
                  <span className="text-gray-400 font-bold">→</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold">
                    {log.newValue}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-gray-400 text-sm">
            No audit logs matching criteria.
          </div>
        )}
      </div>

      {/* Pagination Footer using shared Pagination2 component */}
      <div className="pt-2 mt-4 border-t border-gray-100">
        <Pagination2
          count={filteredLogs.length}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default AuditLogsView;
