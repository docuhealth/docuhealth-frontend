import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Search, X, Eye, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Pagination2 from "../../Patient_Dashboard_Components/Pagination/Pagination2";
import { fetchAuditLogs } from "../../../../queries/Hospital/audits";
import AuditLogSnapshotModal from "./AuditLogSnapshotModal";
import { humanize, personName, resultTestNames } from "./auditLogLabels";

const formatDateTime = (isoString) => {
  if (!isoString) return "Not recorded";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const COPY = {
  laboratory: { item: "Test", fallback: "Lab test result", what: "a lab result" },
  // Scan snapshots carry no scan name, so the report column falls back to the clinical indication
  radiology: { item: "Scan report", fallback: "Scan report", what: "a scan report" },
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return iso && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Not recorded";
};

const formatTime = (iso) => {
  const d = new Date(iso);
  return iso && !Number.isNaN(d.getTime()) ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";
};

// One display row per download entry; the list endpoint only returns downloads
const toRow = (log, type) => {
  const state = log.after_state || log.before_state;
  const tests = resultTestNames(state);
  const indication = Array.isArray(state?.clinical_indication) ? state.clinical_indication.join(", ") : state?.clinical_indication;
  return {
    staffName: personName(log.staff_info) || log.staff_info?.staff_id || "Unknown staff",
    role: humanize(log.staff_info?.role) || "Staff",
    patientName: personName(log.patient_info) || "Unknown patient",
    hin: log.patient_info?.hin,
    testName: type === "radiology" ? indication || COPY.radiology.fallback : tests.length ? tests.join(", ") : COPY.laboratory.fallback,
  };
};

// onBack shows the back arrow (lab admin page); the hospital admin page has its own tabs instead
const AuditLogsView = ({ type = "laboratory", onBack }) => {
  const copy = COPY[type] || COPY.laboratory;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [inspectLog, setInspectLog] = useState(null);

  const searchInputRef = useRef(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [type === "laboratory" ? "lab-audit-logs" : "radiology-audit-logs", currentPage, itemsPerPage],
    queryFn: () => fetchAuditLogs({ type, page: currentPage, pageSize: itemsPerPage }),
    keepPreviousData: true,
    retry: (count, err) => err?.response?.status !== 403 && count < 2,
  });
  const noAccess = error?.response?.status === 403;

  const rawLogs = data?.results || (Array.isArray(data) ? data : []);
  const totalCount = data?.count || rawLogs.length || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Search runs over the current page only
  const q = searchQuery.trim().toLowerCase();
  const rows = rawLogs
    .map((log) => ({ log, ...toRow(log, type) }))
    .filter(
      (r) =>
        !q ||
        [r.staffName, r.role, r.patientName, r.hin, r.testName].some((v) => (v || "").toLowerCase().includes(q))
    );

  const emptyText = q ? "No downloads match your search on this page." : `No ${type === "radiology" ? "scan report" : "result"} downloads have been recorded yet.`;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-xs">
      {/* Top Header Row with Back Button and Search */}
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-gray-100">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2.5 text-slate-800 hover:text-docuhealth-primary font-semibold text-base sm:text-lg tracking-tight transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Audit logs</span>
          </button>
        ) : (
          <h2 className="text-slate-800 font-semibold text-base sm:text-lg tracking-tight">
            {type === "radiology" ? "Radiology downloads" : "Laboratory downloads"}
          </h2>
        )}

        <div className="relative flex items-center">
          {isSearchOpen ? (
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 w-44 sm:w-64 transition-all">
              <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff, patient, test..."
                className="bg-transparent border-none outline-none text-xs sm:text-sm text-gray-700 w-full placeholder:text-gray-400"
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full cursor-pointer"
                aria-label="Close search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-9 h-9 rounded-full bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-100 flex items-center justify-center text-gray-600 hover:text-docuhealth-primary transition-colors cursor-pointer"
              title="Search audit logs"
              aria-label="Search audit logs"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Subheading & total */}
      <div className="pt-5 pb-3 flex items-start sm:items-center justify-between gap-3">
        <div>
          {onBack && <h3 className="text-sm font-semibold text-slate-700">Result downloads</h3>}
          <p className="text-xs text-gray-500 mt-0.5">Every time someone downloads {copy.what}, it is recorded here.</p>
        </div>
        {!isLoading && !isError && (
          <span className="text-xs text-gray-500 shrink-0">
            {totalCount} {totalCount === 1 ? "download" : "downloads"}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 text-sm">
          <div className="w-6 h-6 border-2 border-docuhealth-primary border-t-transparent rounded-full animate-spin mb-3" />
          <span>Loading audit logs...</span>
        </div>
      ) : isError ? (
        <div className={`py-14 text-center text-sm flex flex-col items-center gap-2 ${noAccess ? "text-gray-500" : "text-red-500"}`}>
          <AlertCircle className={`w-8 h-8 ${noAccess ? "text-gray-400" : "text-red-400"}`} />
          <p>
            {noAccess
              ? "Your account cannot view these download logs yet."
              : "Could not load the audit logs. Please try again."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <div className="bg-[#F8F9FB] border border-gray-100/80 rounded-full px-6 py-3.5 grid grid-cols-12 items-center text-xs font-semibold text-slate-600 select-none">
              <div className="col-span-2">Date & Time</div>
              <div className="col-span-3">Downloaded by</div>
              <div className="col-span-3">Patient</div>
              <div className="col-span-2">{copy.item}</div>
              <div className="col-span-2 text-right">Details</div>
            </div>

            <div className="divide-y divide-gray-100 mt-1">
              {rows.length > 0 ? (
                rows.map(({ log, staffName, role, patientName, hin, testName }) => (
                  <div
                    key={log.sqid}
                    className="px-6 py-4 grid grid-cols-12 items-center text-xs sm:text-sm hover:bg-indigo-50/20 transition-colors rounded-xl"
                  >
                    <div className="col-span-2 pr-2">
                      <p className="text-xs font-medium text-slate-800">{formatDate(log.created_at)}</p>
                      <p className="text-[10px] text-gray-400">{formatTime(log.created_at)}</p>
                    </div>

                    <div className="col-span-3 pr-2 min-w-0">
                      <p className="text-slate-800 font-medium truncate text-xs" title={staffName}>
                        {staffName}
                      </p>
                      <p className="text-[10px] text-gray-400">{role}</p>
                    </div>

                    <div className="col-span-3 pr-2 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate" title={patientName}>
                        {patientName}
                      </p>
                      {hin && <p className="text-[10px] text-gray-400">HIN {hin}</p>}
                    </div>

                    <div className="col-span-2 pr-2 min-w-0">
                      <p className="text-xs text-slate-700 truncate" title={testName}>
                        {testName}
                      </p>
                    </div>

                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => setInspectLog(log)}
                        className="inline-flex items-center gap-1 text-xs text-docuhealth-primary hover:text-docuhealth-primary-hover font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-400 text-sm">{emptyText}</div>
              )}
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-3 mt-2">
            {rows.length > 0 ? (
              rows.map(({ log, staffName, role, patientName, hin, testName }) => (
                <button
                  key={log.sqid}
                  type="button"
                  onClick={() => setInspectLog(log)}
                  className="w-full text-left bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-indigo-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 break-words">{testName}</p>
                      <p className="text-xs text-gray-500 mt-0.5 break-words">{patientName}</p>
                      {hin && <p className="text-[11px] text-gray-400">HIN {hin}</p>}
                    </div>
                    {/* Same "View" cue as the desktop table; the whole card opens the details */}
                    <span className="inline-flex items-center gap-1 text-xs text-docuhealth-primary font-semibold shrink-0">
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-xs">
                    <span className="text-slate-700 break-words min-w-0">
                      <span className="font-medium text-slate-800">{staffName}</span> · {role}
                    </span>
                    <span className="text-[11px] text-gray-400 shrink-0">{formatDateTime(log.created_at)}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-10 text-center text-gray-400 text-sm">{emptyText}</div>
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

      <AuditLogSnapshotModal log={inspectLog} onClose={() => setInspectLog(null)} />
    </div>
  );
};

export default AuditLogsView;
