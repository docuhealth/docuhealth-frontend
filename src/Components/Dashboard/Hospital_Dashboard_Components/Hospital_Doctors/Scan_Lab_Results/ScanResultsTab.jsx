import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, ScanLine, X, Info } from "lucide-react";
import DynamicDate from "../../../../DynamicDate/DynamicDate";
import ScanResultReport from "../../Hospital_Radiology/Scan_Requests/ScanResultReport";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { fetchPendingScanResults, acceptScanResult, rejectScanResult } from "../../../../../queries/Hospital/radiology/scan_results";
import { extractApiErrorMessage } from "../../../../../utils/apiError";
import ScanLabResultsShell from "./ScanLabResultsShell";
import ScanLabResultCard, { ScanLabResultGridSkeleton } from "./ScanLabResultCard";
import { maskHIN } from "./scanLabResults";

const PAGE_SIZE = 9;
// The pending endpoint only takes page/size (no search or ordering), so pull the whole queue and search, sort and page it here.
const FETCH_ALL_SIZE = 100;

const patientName = (order) => `${order.patient_info?.firstname || ""} ${order.patient_info?.lastname || ""}`.trim() || "Unknown patient";

// Doctors approve or reject the radiologist's result for scans they ordered; radiologist-ordered scans never show up here.
const Hospital_Doctors_Scan_Results_Tab = ({ activeTab, onTabChange }) => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [selected, setSelected] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["radiology-pending-results", 1, FETCH_ALL_SIZE],
    queryFn: fetchPendingScanResults,
    // Results arrive from the radiologist, so poll to show new ones without a reload. Pauses while the tab is backgrounded.
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const filteredRows = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    const matching = (data?.results || []).filter(
      (row) =>
        !term ||
        [patientName(row), row.patient_info?.hin, row.scan_type].some((field) => field?.toLowerCase().includes(term))
    );
    const direction = ordering === "created_at" ? 1 : -1;
    return matching.sort((a, b) => direction * (new Date(a.created_at) - new Date(b.created_at)));
  }, [data, searchQuery, ordering]);

  const count = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  // A decision can shrink the queue below the page being viewed.
  const page = Math.min(currentPage, totalPages);
  const rows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const closeDetail = () => {
    setSelected(null);
    setShowApproveModal(false);
    setShowRejectModal(false);
    setRejectReason("");
  };

  const onDecided = (message) => {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["radiology-pending-results"] });
    queryClient.invalidateQueries({ queryKey: ["patient-approved-scan-results"] });
    closeDetail();
  };

  const approveMutation = useMutation({
    mutationFn: acceptScanResult,
    onSuccess: () => onDecided("Result approved"),
    onError: (err) => {
      setShowApproveModal(false);
      toast.error(extractApiErrorMessage(err, "Failed to approve this result."));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectScanResult,
    onSuccess: () => onDecided("Result rejected. The radiologist can upload a new one."),
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to reject this result.")),
  });

  if (selected) {
    const decisionPending = approveMutation.isPending || rejectMutation.isPending;
    return (
      <>
        <div className="py-2">
          <DynamicDate />
        </div>

        <div className="bg-white rounded-xl border mt-3 p-5 text-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 gap-4 sm:gap-0">
            <button type="button" onClick={closeDetail} className="flex items-center gap-1 cursor-pointer">
              <ArrowLeft size={14} />
              <span>Radiology result approval</span>
            </button>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                disabled={decisionPending}
                className="flex-1 sm:flex-none border border-red-400 text-red-500 rounded-full py-1.5 px-4 disabled:opacity-60"
              >
                Reject result
              </button>
              <button
                type="button"
                onClick={() => setShowApproveModal(true)}
                disabled={decisionPending}
                className="flex-1 sm:flex-none border border-docuhealth-primary text-white bg-docuhealth-primary rounded-full py-1.5 px-4 disabled:opacity-60"
              >
                Approve result
              </button>
            </div>
          </div>

          <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-docuhealth-dark">{patientName(selected)}</p>
              <p className="text-xs text-gray-500">Patient HIN: {maskHIN(selected.patient_info?.hin)}</p>
              <p className="text-xs text-gray-500">
                Gender: <span className="capitalize">{selected.patient_info?.sex || "—"}</span>
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-gray-400">Imaging order:</p>
              <p className="text-sm font-bold text-docuhealth-dark">{selected.scan_type}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-gray-400">Date/Time of scan request:</p>
              <p className="text-sm font-semibold text-docuhealth-dark">{formatFullDateTime(selected.created_at) || "—"}</p>
            </div>
          </div>

          <ScanResultReport report={selected.report} attachments={selected.attachments} />
        </div>

        {showApproveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col items-center gap-4 relative">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="absolute right-4 top-4 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
              <div className="w-11 h-11 rounded-full border-2 border-gray-800 flex items-center justify-center text-gray-800">
                <Info size={20} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 text-center">Confirm approval</h3>
              <p className="text-sm text-gray-600 leading-relaxed border border-gray-200 rounded-xl px-4 py-3 w-full">
                Approving marks this scan as completed and makes the result final. Please make sure you have reviewed the report and attachments.
              </p>
              <button
                type="button"
                onClick={() => approveMutation.mutate({ sqid: selected.result_sqid })}
                disabled={approveMutation.isPending}
                className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3 rounded-full hover:bg-docuhealth-dark-primary transition-colors disabled:opacity-60"
              >
                {approveMutation.isPending ? "Approving..." : "Approve result"}
              </button>
            </div>
          </div>
        )}

        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5 relative">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="absolute right-5 top-5 text-gray-800 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              <div className="text-center pr-6">
                <h3 className="text-base font-semibold text-gray-900">Reject result</h3>
                <p className="text-sm text-gray-500 mt-1">The radiologist will see your reason and can upload a new result.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Reason :</label>
                <textarea
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter your reason for rejecting this result..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-700 outline-none focus:border-red-400 resize-none transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => rejectMutation.mutate({ sqid: selected.result_sqid, rejection_reason: rejectReason.trim() })}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                className="w-full bg-red-600 text-white text-sm font-semibold py-3.5 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject result"}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <ScanLabResultsShell
      activeTab={activeTab}
      onTabChange={onTabChange}
      searchQuery={searchQuery}
      onSearchChange={(value) => {
        setSearchQuery(value);
        setCurrentPage(1);
      }}
      searchPlaceholder="Search patient, HIN or scan..."
      ordering={ordering}
      onOrderingChange={(value) => {
        setOrdering(value);
        setCurrentPage(1);
      }}
      count={count}
      currentPage={page}
      totalPages={totalPages}
      setCurrentPage={setCurrentPage}
    >
      {isLoading ? (
        <ScanLabResultGridSkeleton label="Loading scan results" />
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <ScanLine size={36} className="opacity-25 mb-2" />
          <h2 className="font-medium pb-1 text-gray-800">No scan results!</h2>
          <p className="text-[12px] text-gray-500 max-w-md text-center">There are no scan results to approve at the moment.</p>
        </div>
      ) : (
        <div className="text-[12px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rows.map((row) => (
            <ScanLabResultCard
              key={row.result_sqid}
              title={row.scan_type}
              badge="Imaging result"
              patient={{ name: patientName(row), hin: row.patient_info?.hin }}
              statusRows={[{ label: "Approval Status", value: "Pending", className: "text-amber-500" }]}
              reporter={row.report?.reporter || "N/A"}
              dateTime={formatFullDateTime(row.report?.reported_at) || "N/A"}
              onOpen={() => setSelected(row)}
            />
          ))}
        </div>
      )}
    </ScanLabResultsShell>
  );
};

export default Hospital_Doctors_Scan_Results_Tab;
