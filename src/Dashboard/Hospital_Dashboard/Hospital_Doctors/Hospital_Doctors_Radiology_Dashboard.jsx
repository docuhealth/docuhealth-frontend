import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, ScanLine, X, Info } from "lucide-react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import Pagination2 from "../../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";
import ScanResultReport from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Radiology/Scan_Requests/ScanResultReport";
import { formatFullDateTime } from "../../../Components/Dashboard/Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { fetchPendingScanResults, acceptScanResult, rejectScanResult } from "../../../queries/Hospital/radiology/scan_results";
import { extractApiErrorMessage } from "../../../utils/apiError";

const PAGE_SIZE = 9;

const patientName = (order) => `${order.patient_info?.firstname || ""} ${order.patient_info?.lastname || ""}`.trim() || "Unknown patient";

const maskHIN = (hin) => {
  if (!hin) return "—";
  return hin.length >= 6 ? `${hin.slice(0, 4)}••••${hin.slice(-2)}` : hin;
};

// Doctors approve or reject the radiologist's result for scans they ordered; walk-in orders never show up here.
const Hospital_Doctors_Radiology_Dashboard = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["radiology-pending-results", currentPage, PAGE_SIZE],
    queryFn: fetchPendingScanResults,
    // Results arrive from the radiologist, so poll to show new ones without a reload. Pauses while the tab is backgrounded.
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const rows = data?.results || [];
  const count = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const closeDetail = () => {
    setSelected(null);
    setShowApproveModal(false);
    setShowRejectModal(false);
    setRejectReason("");
  };

  const onDecided = (message) => {
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["radiology-pending-results"] });
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
    <>
      <div className="py-2 text-sm flex justify-between items-center">
        <DynamicDate />
      </div>
      <div className="bg-white my-5 rounded-lg">
        <div className="border rounded-lg p-4 lg:p-6">
          <div className="mb-4 pb-2 border-b">
            <h2 className="font-medium capitalize">Radiology Results Approvals</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40 text-sm">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col justify-center items-center text-center py-10 text-gray-400">
              <ScanLine size={40} className="opacity-25 mb-2" />
              <h2 className="font-medium pb-1 text-gray-800">No radiology results!</h2>
              <p className="text-[12px] text-gray-500 max-w-md">There are no radiology results to approve at the moment.</p>
            </div>
          ) : (
            <>
              <div className="text-[12px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {rows.map((row) => (
                  <div key={row.result_sqid} className="bg-white border rounded-xl p-4">
                    <div className="flex justify-between items-center mb-1 gap-2">
                      <p className="font-bold text-docuhealth-dark text-[15px]">{row.scan_type}</p>
                      <div className="bg-docuhealth-primary-muted px-3 py-1 rounded-full shrink-0">
                        <p className="text-docuhealth-primary text-[11px] font-medium">Radiology result</p>
                      </div>
                    </div>

                    <p className="text-xs mb-2 flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-gray-800 capitalize">{patientName(row)}</span>
                      <span className="text-gray-400">· {maskHIN(row.patient_info?.hin)}</span>
                    </p>

                    <div className="flex items-center gap-1 mb-3">
                      <p className="text-gray-400 text-xs">Approval Status: </p>
                      <p className="text-xs font-semibold text-amber-500">Pending</p>
                    </div>

                    <div className="border-t border-gray-100 my-3"></div>

                    <div className="flex flex-col gap-1.5 mb-3 text-gray-500 text-[12px]">
                      <p>Reported by: {row.report?.reporter || "N/A"}</p>
                      <p>{formatFullDateTime(row.report?.reported_at) || "N/A"}</p>
                    </div>

                    <div className="border-t border-gray-100 my-3"></div>

                    <button
                      onClick={() => setSelected(row)}
                      className="w-full bg-docuhealth-primary hover:bg-docuhealth-dark-primary text-white text-[12px] font-medium py-2 rounded-full transition-colors cursor-pointer"
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Pagination2 count={count} currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Hospital_Doctors_Radiology_Dashboard;
