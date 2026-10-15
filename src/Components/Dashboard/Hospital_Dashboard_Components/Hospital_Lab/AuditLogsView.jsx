import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Search, ChevronDown, X, Clock, Eye, AlertCircle, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Pagination2 from "../../Patient_Dashboard_Components/Pagination/Pagination2";
import { fetchLabAuditLogs } from "../../../../queries/Hospital/lab/requests";
import Modal from "../../../ui/Modal";

const getInitials = (firstname, lastname) => {
  const f = firstname?.[0] || "";
  const l = lastname?.[0] || "";
  return (f + l).toUpperCase() || "ST";
};

const formatDateTime = (isoString) => {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
};

const getActionBadge = (action = "") => {
  const lower = action.toLowerCase();
  if (lower.includes("approve")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (lower.includes("reject")) return "bg-rose-50 text-rose-700 border-rose-200";
  if (lower.includes("accept")) return "bg-blue-50 text-blue-700 border-blue-200";
  if (lower.includes("submit")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (lower.includes("specimen") || lower.includes("collection")) return "bg-purple-50 text-purple-700 border-purple-200";
  if (lower.includes("create")) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
};

const extractValueDisplay = (state, field) => {
  if (!state) return "null";
  if (!field) return JSON.stringify(state);
  const val = state[field];
  if (val === undefined || val === null) return "—";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
};

const AuditLogsView = ({ onBack }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedActionFilter, setSelectedActionFilter] = useState("All actions");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [inspectLog, setInspectLog] = useState(null);

  const searchInputRef = useRef(null);
  const filterDropdownRef = useRef(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["lab-audit-logs", currentPage, itemsPerPage],
    queryFn: () => fetchLabAuditLogs({ page: currentPage, pageSize: itemsPerPage }),
    keepPreviousData: true,
  });

  const rawLogs = data?.results || (Array.isArray(data) ? data : []);
  const totalCount = data?.count || rawLogs.length || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

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

  // Client-side filtering for search & action choices
  const filteredLogs = rawLogs.filter((log) => {
    const actionText = log.action_display || log.action || "";
    const staffName = `${log.staff_info?.firstname || ""} ${log.staff_info?.lastname || ""}`.trim();
    const targetType = log.target_type || "";
    const field = log.field_changed || "";

    const matchesAction =
      selectedActionFilter === "All actions" ||
      actionText.toLowerCase().includes(selectedActionFilter.toLowerCase()) ||
      (log.action || "").toLowerCase().includes(selectedActionFilter.toLowerCase());

    const matchesSearch =
      searchQuery.trim() === "" ||
      actionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      targetType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesAction && matchesSearch;
  });

  const ACTION_FILTERS = [
    "All actions",
    "Result Approved",
    "Result Rejected",
    "Result Submitted",
    "Item Accepted",
    "Item Rejected",
    "Specimen Collection",
    "Order Created",
  ];

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
                  onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Action Filter Dropdown */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full border border-docuhealth-primary text-docuhealth-primary hover:bg-indigo-50 transition-colors text-xs sm:text-sm font-medium cursor-pointer"
            >
              <span>{selectedActionFilter}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isFilterDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1.5 text-xs sm:text-sm max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                {ACTION_FILTERS.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSelectedActionFilter(item);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors cursor-pointer ${
                      selectedActionFilter === item
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

      {/* Subheading & total */}
      <div className="pt-5 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Laboratory Audit Log Records</h3>
        <span className="text-xs text-gray-500">{totalCount} total entries</span>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 text-sm">
          <div className="w-6 h-6 border-2 border-docuhealth-primary border-t-transparent rounded-full animate-spin mb-3" />
          <span>Loading laboratory audit logs...</span>
        </div>
      ) : isError ? (
        <div className="py-14 text-center text-red-500 text-sm flex flex-col items-center gap-2">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p>{error?.response?.data?.detail || "Failed to load audit logs. Lab Admin privilege required."}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <div className="bg-[#F8F9FB] border border-gray-100/80 rounded-full px-6 py-3.5 grid grid-cols-12 items-center text-xs font-semibold text-slate-600 select-none">
              <div className="col-span-2">Date & Time</div>
              <div className="col-span-3">Actor / Staff</div>
              <div className="col-span-3">Action</div>
              <div className="col-span-2">Target & Field</div>
              <div className="col-span-2 text-right">Details</div>
            </div>

            <div className="divide-y divide-gray-100 mt-1">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const staffName = `${log.staff_info?.firstname || ""} ${log.staff_info?.lastname || ""}`.trim() || log.staff_info?.staff_id || "System";
                  const role = log.staff_info?.role?.replace(/_/g, " ") || "staff";
                  const actionDisplay = log.action_display || log.action?.replace(/_/g, " ") || "—";
                  const fieldChanged = log.field_changed || (log.before_state ? "Modified" : "Created");

                  return (
                    <div
                      key={log.sqid}
                      className="px-6 py-4 grid grid-cols-12 items-center text-xs sm:text-sm hover:bg-indigo-50/20 transition-colors rounded-xl"
                    >
                      {/* Date & Time */}
                      <div className="col-span-2 text-slate-600 font-medium text-xs flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatDateTime(log.created_at)}</span>
                      </div>

                      {/* Actor Staff */}
                      <div className="col-span-3 flex items-center gap-2 pr-2">
                        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 text-docuhealth-primary font-bold text-[10px] flex items-center justify-center shrink-0 border border-indigo-200/60 shadow-2xs">
                          {getInitials(log.staff_info?.firstname, log.staff_info?.lastname)}
                        </span>
                        <div className="truncate">
                          <p className="text-slate-800 font-medium truncate text-xs" title={staffName}>
                            {staffName}
                          </p>
                          <p className="text-[10px] text-gray-400 capitalize">
                            {role} {log.staff_info?.specialization ? `· ${log.staff_info.specialization}` : ""}
                          </p>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="col-span-3 pr-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionBadge(log.action)}`}>
                          {actionDisplay}
                        </span>
                      </div>

                      {/* Target & Field */}
                      <div className="col-span-2 pr-2">
                        <p className="text-xs font-semibold text-slate-700 capitalize">
                          {log.target_type?.replace(/_/g, " ") || "Record"}
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          {fieldChanged ? `field: ${fieldChanged}` : `sqid: ${log.target_sqid || "—"}`}
                        </p>
                      </div>

                      {/* Details View Button */}
                      <div className="col-span-2 text-right">
                        <button
                          onClick={() => setInspectLog(log)}
                          className="inline-flex items-center gap-1 text-xs text-docuhealth-primary hover:text-docuhealth-primary-hover font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-gray-400 text-sm">
                  No audit logs matching your search/filter criteria.
                </div>
              )}
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-3 mt-2">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                const staffName = `${log.staff_info?.firstname || ""} ${log.staff_info?.lastname || ""}`.trim() || "Staff";
                const role = log.staff_info?.role?.replace(/_/g, " ") || "staff";
                const actionDisplay = log.action_display || log.action?.replace(/_/g, " ") || "—";

                return (
                  <div
                    key={log.sqid}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-gray-100">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionBadge(log.action)}`}>
                        {actionDisplay}
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {formatDateTime(log.created_at)}
                      </span>
                    </div>

                    <div className="pt-2 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-slate-700 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 text-docuhealth-primary font-bold text-[9px] flex items-center justify-center shrink-0 border border-indigo-200/60">
                            {getInitials(log.staff_info?.firstname, log.staff_info?.lastname)}
                          </span>
                          <span className="font-medium text-slate-800">{staffName} ({role})</span>
                        </div>
                        <button
                          onClick={() => setInspectLog(log)}
                          className="text-docuhealth-primary font-semibold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-gray-500">
                        Target: <span className="font-semibold capitalize">{log.target_type?.replace(/_/g, " ")}</span>
                        {log.field_changed && (
                          <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded text-[10px]">
                            {log.field_changed}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-gray-400 text-sm">
                No audit logs found.
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="pt-2 mt-4 border-t border-gray-100">
            <Pagination2
              count={totalCount}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </>
      )}

      {/* Snapshot Diff / Inspection Modal */}
      {inspectLog && (
        <Modal
          isOpen={!!inspectLog}
          onClose={() => setInspectLog(null)}
          title="Audit Log State Snapshot"
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-400 text-[11px]">Action</p>
                <p className="font-semibold text-slate-800">{inspectLog.action_display || inspectLog.action}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[11px]">Timestamp</p>
                <p className="font-medium text-slate-800">{formatDateTime(inspectLog.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[11px]">Actor</p>
                <p className="font-medium text-slate-800">
                  {inspectLog.staff_info?.firstname} {inspectLog.staff_info?.lastname} ({inspectLog.staff_info?.role})
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-[11px]">Target</p>
                <p className="font-medium text-slate-800 font-mono">
                  {inspectLog.target_type} ({inspectLog.target_sqid})
                </p>
              </div>
            </div>

            {inspectLog.field_changed && (
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <p className="font-semibold text-docuhealth-primary mb-1">
                  Field Changed: <span className="font-mono text-slate-800">{inspectLog.field_changed}</span>
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-rose-50/80 p-2.5 rounded-lg border border-rose-100">
                    <p className="text-[10px] uppercase font-bold text-rose-700 mb-1">Before State</p>
                    <pre className="text-xs text-rose-900 overflow-x-auto whitespace-pre-wrap font-mono">
                      {extractValueDisplay(inspectLog.before_state, inspectLog.field_changed)}
                    </pre>
                  </div>
                  <div className="bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-100">
                    <p className="text-[10px] uppercase font-bold text-emerald-700 mb-1">After State</p>
                    <pre className="text-xs text-emerald-900 overflow-x-auto whitespace-pre-wrap font-mono">
                      {extractValueDisplay(inspectLog.after_state, inspectLog.field_changed)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Raw JSON Accordion / View */}
            <div className="space-y-2">
              <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-gray-500" />
                <span>Complete Snapshots</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="border border-gray-200 rounded-xl p-2.5 bg-gray-50 max-h-48 overflow-y-auto">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">before_state</p>
                  <pre className="text-[11px] font-mono text-gray-700 whitespace-pre-wrap">
                    {inspectLog.before_state ? JSON.stringify(inspectLog.before_state, null, 2) : "null (Record Created)"}
                  </pre>
                </div>
                <div className="border border-gray-200 rounded-xl p-2.5 bg-gray-50 max-h-48 overflow-y-auto">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">after_state</p>
                  <pre className="text-[11px] font-mono text-gray-700 whitespace-pre-wrap">
                    {inspectLog.after_state ? JSON.stringify(inspectLog.after_state, null, 2) : "null"}
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setInspectLog(null)}
                className="px-6 py-2 bg-docuhealth-primary text-white rounded-full font-medium hover:bg-docuhealth-dark-primary text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AuditLogsView;
