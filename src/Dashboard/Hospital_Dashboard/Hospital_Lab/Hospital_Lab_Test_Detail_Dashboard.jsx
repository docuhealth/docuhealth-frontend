import { useState, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { ArrowLeft, X, Download, Eye } from "lucide-react";
import RejectModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/RejectModal";
import toast from "react-hot-toast";
import {
  fetchLabOrderDetail,
  acceptLabRequest,
  rejectLabRequest,
  logSpecimenCollectionTime,
  approveLabTestResultByLabAdmin,
  approveLabTestResultByDoctor,
  rejectLabTestResultByDoctor,
  rejectLabTestResultByLabAdmin,
  logLabResultDownload,
} from "../../../queries/Hospital/lab/requests";
import DoctorReviewModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/DoctorReviewModal";
import AcceptApprovalModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/AcceptApprovalModal";
import ApprovalSuccessModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/ApprovalSuccessModal";
import RejectApprovalModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/RejectApprovalModal";
import { LabAppContext } from "../../../context/HospitalContext/Lab/LabAppContext";
import { extractApiErrorMessage } from "../../../utils/apiError";
import { printElement, downloadElementAsPdf } from "../../../utils/exportElement";
import docuhealth_logo from "../../../assets/img/docuhealth_logo.png";
import LabOfficialReportTemplate from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/LabOfficialReportTemplate";

const STATUS_STYLES = {
  pending:                      { label: "Pending",                  color: "text-amber-600" },
  sample_collected:             { label: "Sample Collected",         color: "text-blue-600" },
  in_progress:                  { label: "In Progress",              color: "text-amber-600" },
  result_ready:                 { label: "Result Ready",             color: "text-blue-600" },
  lab_admin_approved:           { label: "Awaiting Doctor Approval", color: "text-amber-600" },
  lab_admin_rejected:           { label: "Rejected by Lab Admin",    color: "text-red-500" },
  result_accepted_by_lab_admin: { label: "Lab Admin Approved",       color: "text-indigo-600" },
  result_accepted_by_doctor:    { label: "Doctor Approved",          color: "text-green-600" },
  completed:                    { label: "Completed",                color: "text-green-600" },
  rejected:                     { label: "Rejected",                 color: "text-red-500" },
  approved:                     { label: "Approved",                 color: "text-green-600" },
  accepted:                     { label: "Accepted",                 color: "text-green-600" },
};

const calcAge = (dob) => {
  if (!dob) return null;
  const years = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  return isNaN(years) ? null : `${years} yrs`;
};

// Show only the first 4 and last 2 digits of the HIN; mask everything between.
const maskHin = (hin) => {
  const s = String(hin ?? "");
  return s.length > 6 ? `${s.slice(0, 4)}${"•".repeat(s.length - 6)}${s.slice(-2)}` : s;
};

const getRefRange = (p) => {
  if (p.ref_text) return p.ref_text;
  if (p.ref_low != null && p.ref_high != null) return `${p.ref_low} – ${p.ref_high}`;
  return "—";
};

const getParamStatus = (value, p) => {
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  if (p.ref_low != null && p.ref_high != null) {
    return num >= p.ref_low && num <= p.ref_high ? "Normal" : "Abnormal";
  }
  return null;
};

const normalizeOrder = (raw, tab) => ({
  id:                    raw.order_info?.sqid || raw.order_sqid || raw.order?.sqid || raw.order || raw.sqid || raw.id,
  name:                  raw.name || [raw.patient_info?.firstname, raw.patient_info?.lastname].filter(Boolean).join(" ") || (raw.test_info ? raw.test_info.name : "Unknown"),
  hin:                   raw.patient_info?.hin || raw.hin || "—",
  hospital:              raw.hospital_info?.name || raw.hospital || "—",
  datetime:              (raw.created_at || raw.result_info?.created_at)
    ? new Date(raw.created_at || raw.result_info?.created_at).toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : raw.datetime || "—",
  tab,
  requestedBy:           raw.ordered_by
    ? `${raw.ordered_by.role === "doctor" ? "Dr. " : ""}${raw.ordered_by.firstname || ""} ${raw.ordered_by.lastname || ""}`.trim()
    : (raw.result_info?.submitted_by ? `${raw.result_info.submitted_by.firstname || ""} ${raw.result_info.submitted_by.lastname || ""}`.trim() : raw.requestedBy),
  gender:                raw.patient_info?.gender || raw.gender,
  dob:                   raw.patient_info?.dob || raw.dob,
  payment_category:      raw.patient_info?.payment_category || raw.payment_category,
  email:                 raw.hospital_info?.email || raw.email,
  aggregate_status:      raw.aggregate_status || raw.status,
  items:                 (raw.items_info?.length ? raw.items_info : null) || (raw.items?.length ? raw.items : null) || (raw.test_info ? [raw] : []),
  specimen_collected_at: (raw.items_info?.[0]?.specimen_collected_at || raw.items?.[0]?.specimen_collected_at || raw.specimen_collected_at)
    ? new Date(raw.items_info?.[0]?.specimen_collected_at || raw.items?.[0]?.specimen_collected_at || raw.specimen_collected_at).toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : undefined,
});

const LabTestItem = ({ order, item, isDoctorView, isLabAdmin, queryClient }) => {
  const navigate = useNavigate();
  
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDoctorReviewModalOpen, setIsDoctorReviewModalOpen] = useState(false);
  const [doctorReviewType, setDoctorReviewType] = useState("approve");

  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [fromAccept, setFromAccept] = useState(false);
  const [justLoggedSample, setJustLoggedSample] = useState(false);
  const [sampleDate, setSampleDate] = useState("");
  const [sampleTime, setSampleTime] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [doctorReviewReason, setDoctorReviewReason] = useState("");

  const displayStatus = isDoctorView && item.result_info?.status ? item.result_info.status : item.status;
  const statusStyle  = STATUS_STYLES[displayStatus] ?? STATUS_STYLES.pending;
  
  const isPending    = item.status === "pending";
  const isSampleCollected = item.status === "sample_collected";
  const isInProgress = item.status === "in_progress";
  const isResultReady =
    item.status === "result_ready" ||
    item.status === "result_accepted_by_lab_admin" ||
    item.status === "completed";
  const isRejected   = item.status === "rejected";
  // Gate on status, not specimen_collected_at: a rejected result drops the item back to in_progress with the old time kept, and the backend wants the sample logged again
  const sampleLogged = isSampleCollected || justLoggedSample;
  const resultSentBack = ["lab_admin_rejected", "rejected"].includes(item.result_info?.status);
  // approve/reject-by-doctor 400 until the lab admin has approved the result
  const awaitingLabAdmin = isDoctorView && item.status === "result_ready" && item.result_info?.status === "pending";
  // Lab admin reviews each test on its own, so one test can be sent back without touching the others
  const labAdminCanReview = isLabAdmin && !isDoctorView && item.status === "result_ready";

  // On the doctor's "Reviewed" tab an already-actioned result comes back with
  // `item.status` bumped off `result_ready` (approve keeps it, reject drops it
  // to `in_progress`). Still render its result table + outcome, read-only.
  const reviewedResultStatus = isDoctorView ? item.result_info?.status : null;
  const isReviewedResult = ["accepted", "approved", "rejected"].includes(reviewedResultStatus);
  // Doctors only see values after the lab admin approves
  const showResultBody = (isResultReady || isReviewedResult) && !awaitingLabAdmin;

  const specimens    = item.test_info?.specimens ?? [];
  const preferredSpecimen = specimens.find((s) => s.is_preferred) ?? specimens[0];
  const specimenLabel = preferredSpecimen
    ? `${preferredSpecimen.name}${preferredSpecimen.container ? ` (${preferredSpecimen.container})` : ""}`
    : "—";

  const resultParams = item.result_info?.parameters_info ?? item.result_info?.parameters ?? (item.test_info?.parameters || []).map(p => ({
    parameter_info: p,
    value: null,
    status: null
  }));

  const actualItemSqid = item.sqid;

  const invalidateAllLabQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["lab-requests"] });
    queryClient.invalidateQueries({ queryKey: ["lab-dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["lab-order"] });
    queryClient.invalidateQueries({ queryKey: ["lab-order-item"] });
    queryClient.invalidateQueries({ queryKey: ["lab-audit-logs"] });
    queryClient.invalidateQueries({ queryKey: ["doctor-lab-records"] });
    queryClient.invalidateQueries({ queryKey: ["patient-lab-records"] });
  };

  const acceptMutation = useMutation({
    mutationFn: () => acceptLabRequest({ order_sqid: order.id, item_sqid: actualItemSqid }),
    onSuccess: () => {
      toast.success("Request accepted — moved to In Progress");
      setShowAcceptModal(false);
      invalidateAllLabQueries();
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to accept request"));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (data) => rejectLabRequest(data),
    onSuccess: () => {
      toast.success("Request rejected successfully!");
      setIsRejectModalOpen(false);
      invalidateAllLabQueries();
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to reject request"));
    },
  });

  const specimenMutation = useMutation({ 
    mutationFn: (data) => logSpecimenCollectionTime(data) 
  });

  const approveMutation = useMutation({
    mutationFn: () => (isDoctorView ? approveLabTestResultByDoctor : approveLabTestResultByLabAdmin)({ item_sqid: actualItemSqid }),
    onSuccess: () => {
      toast.success("Result approved successfully!");
      setIsDoctorReviewModalOpen(false);
      invalidateAllLabQueries();
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to approve result"));
    },
  });

  const rejectDoctorMutation = useMutation({
    mutationFn: () => (isDoctorView ? rejectLabTestResultByDoctor : rejectLabTestResultByLabAdmin)({ item_sqid: actualItemSqid, rejection_reason: doctorReviewReason.trim() }),
    onSuccess: () => {
      toast.success("Result rejected successfully!");
      setIsDoctorReviewModalOpen(false);
      setDoctorReviewReason("");
      invalidateAllLabQueries();
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to reject result"));
    },
  });

  const handleSampleSubmit = async () => {
    // Send UTC like the radiology pages do; a bare local time was stored as UTC, so times showed an hour late
    const specimen_collected_at = new Date(`${sampleDate}T${sampleTime}`).toISOString();
    try {
      if (fromAccept) {
        await acceptMutation.mutateAsync();
        toast.success("Request accepted");
        setFromAccept(false);
      }
      await specimenMutation.mutateAsync({ order_sqid: order.id, item_sqid: actualItemSqid, specimen_collected_at });
      toast.success("Sample collection logged");
      setShowSampleModal(false);
      setJustLoggedSample(true);
      invalidateAllLabQueries();
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Something went wrong. Please try again."));
    }
  };

  return (
    <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden" data-pdf-unit>
      <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-docuhealth-dark">{item.test_info?.name || "Unknown Test"}</h3>
          <p className="text-xs font-medium text-gray-500 mt-1">
            Status: <span className={`font-semibold ${statusStyle.color}`}>{statusStyle.label}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto" data-print-hide>
          {isPending && !isDoctorView && (
            <>
              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
                className="w-full sm:w-auto border border-red-400 text-red-500 text-xs font-medium px-8 py-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer text-center"
              >
                Reject
              </button>
              <button
                onClick={() => setShowAcceptModal(true)}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
                className="w-full sm:w-auto border border-docuhealth-primary text-docuhealth-primary text-xs font-medium px-8 py-2 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50 cursor-pointer text-center"
              >
                Accept
              </button>
            </>
          )}

          {(isSampleCollected || isInProgress) && !isDoctorView && (
            <>
              {/* backend only accepts specimen time while in_progress (first time or after a rejected result) */}
              {isInProgress && !sampleLogged && (
                <button
                  onClick={() => setShowSampleModal(true)}
                  className="w-full sm:w-auto border border-docuhealth-primary text-docuhealth-primary text-xs font-medium px-4 py-2 rounded-full hover:bg-indigo-50 transition-colors"
                >
                  Log sample
                </button>
              )}
              <button
                onClick={() => navigate("/hospital-lab-upload-result", { state: { order, item } })}
                disabled={!sampleLogged}
                className="w-full sm:w-auto bg-docuhealth-primary text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-docuhealth-dark-primary transition-colors disabled:opacity-40"
              >
                Upload result
              </button>
            </>
          )}

          {awaitingLabAdmin && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 rounded-full text-center">
              Waiting for lab admin approval
            </span>
          )}

          {((isResultReady && isDoctorView && !awaitingLabAdmin) || labAdminCanReview) && (
            <>
              <button
                onClick={() => { setDoctorReviewType("reject"); setDoctorReviewReason(""); setIsDoctorReviewModalOpen(true); }}
                disabled={displayStatus === "rejected" || displayStatus === "accepted" || displayStatus === "approved"}
                className={`w-full sm:w-auto border text-xs font-medium px-4 py-2 rounded-full transition-colors ${
                  displayStatus === "rejected" || displayStatus === "accepted" || displayStatus === "approved"
                    ? "border-red-200 text-red-300 cursor-not-allowed" : "border-red-500 text-red-500 hover:bg-red-50"
                }`}
              >
                Reject result
              </button>
              <button
                onClick={() => { setDoctorReviewType("approve"); setDoctorReviewReason(""); setIsDoctorReviewModalOpen(true); }}
                disabled={displayStatus === "rejected" || displayStatus === "accepted" || displayStatus === "approved"}
                className={`w-full sm:w-auto text-xs font-medium px-4 py-2 rounded-full transition-colors ${
                  displayStatus === "rejected" || displayStatus === "accepted" || displayStatus === "approved"
                    ? "bg-docuhealth-primary-soft text-white cursor-not-allowed" : "bg-docuhealth-primary text-white hover:bg-docuhealth-dark-primary"
                }`}
              >
                Accept result
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white px-4 sm:px-6 py-5 flex flex-col gap-4">
        {(isPending || isSampleCollected || isInProgress) && !isReviewedResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Specimen needed:</p>
              <p className="text-sm font-semibold text-docuhealth-primary">{specimenLabel}</p>
            </div>
            {item.test_info?.special_instructions && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Special instructions:</p>
                <p className="text-sm text-gray-600 leading-relaxed">{item.test_info.special_instructions}</p>
              </div>
            )}
            {item.note && (
              <div className="col-span-1 md:col-span-2">
                <p className="text-xs text-gray-500 mb-1">Note:</p>
                <p className="text-sm text-gray-600 leading-relaxed">{item.note}</p>
              </div>
            )}
          </div>
        )}

        {showResultBody && (
          <div className="flex flex-col gap-5">
            {isReviewedResult && (
              <div className={`p-3 rounded-lg border text-sm ${
                reviewedResultStatus === "rejected"
                  ? "bg-red-50 border-red-100 text-red-800"
                  : "bg-green-50 border-green-100 text-green-800"
              }`}>
                <span className="font-semibold capitalize">
                  {reviewedResultStatus === "rejected" ? "Rejected" : "Approved"}
                </span>
                {reviewedResultStatus === "rejected" && item.rejection_reason
                  ? ` — ${item.rejection_reason}`
                  : ""}
              </div>
            )}
            {resultParams.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-800 mb-4">Results</p>
                <div className="hidden lg:block overflow-x-auto">
                  <div className="min-w-[600px] flex flex-col border border-gray-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-4 text-left text-sm font-semibold text-gray-700 bg-docuhealth-bg-offwhite py-3 px-4 border-b border-gray-200">
                      <p>Test Parameter</p>
                      <p>Result</p>
                      <p>Reference range</p>
                      <p>Status</p>
                    </div>
                    {resultParams.map((p, i) => {
                      const info = p.parameter_info;
                      const paramStatus = p.status ?? getParamStatus(p.value, info);
                      const isLast = i === resultParams.length - 1;
                      const statusText = paramStatus ?? "—";
                      const statusLower = statusText.toLowerCase();
                      const isRed = statusLower === "negative" || statusLower === "abnormal";
                      const isGreen = statusLower === "positive" || statusLower === "normal";
                      
                      return (
                        <div key={i} className={`grid grid-cols-4 items-center text-sm text-gray-600 py-3 px-4 ${isLast ? "" : "border-b border-gray-100"}`}>
                          <p className="font-medium text-gray-800">{info.name}</p>
                          <p>{p.value ?? "—"} {info.unit || ""}</p>
                          <p>{getRefRange(info)}</p>
                          <p className={`capitalize font-medium ${isRed ? "text-red-500" : isGreen ? "text-green-600" : "text-gray-500"}`}>
                            {statusText}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Mobile Cards */}
                <div className="lg:hidden flex flex-col gap-3">
                  {resultParams.map((p, i) => {
                    const info = p.parameter_info;
                    const paramStatus = p.status ?? getParamStatus(p.value, info);
                    const statusText = paramStatus ?? "—";
                    const statusLower = statusText.toLowerCase();
                    const isRed = statusLower === "negative" || statusLower === "abnormal";
                    const isGreen = statusLower === "positive" || statusLower === "normal";

                    return (
                      <div key={i} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                        <div className="flex justify-between items-start mb-3">
                          <p className="font-bold text-sm text-gray-800">{info.name}</p>
                          <span className={`text-[10px] px-2 py-1 rounded-md border font-medium capitalize ${
                            isGreen ? "bg-green-50 text-green-600 border-green-100" :
                            isRed ? "bg-red-50 text-red-500 border-red-100" :
                            "bg-gray-100 text-gray-600 border-gray-200"
                          }`}>
                            {statusText}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-400 mb-1 uppercase text-[10px] font-semibold">Result</p>
                            <p className="font-semibold text-gray-800">{p.value ?? "—"} {info.unit || ""}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-1 uppercase text-[10px] font-semibold">Ref Range</p>
                            <p className="font-medium text-gray-600">{getRefRange(info)}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {(item.result_info?.interpretation || item.result_info?.clinical_correlation || item.result_info?.comments) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                {item.result_info?.interpretation && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Interpretation:</p>
                    <p className="text-sm font-medium text-gray-800 whitespace-pre-line">{item.result_info.interpretation}</p>
                  </div>
                )}
                {item.result_info?.clinical_correlation && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Clinical correlation:</p>
                    <p className="text-sm font-medium text-gray-800 whitespace-pre-line">{item.result_info.clinical_correlation}</p>
                  </div>
                )}
                {item.result_info?.comments && (
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Comments:</p>
                    <p className="text-sm font-medium text-gray-800">{item.result_info.comments}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {item.specimen_collected_at && (
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex items-center justify-between">
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-blue-500 mb-0.5">Sample collected on:</p>
                <p className="text-sm font-medium text-blue-900">
                  {new Date(item.specimen_collected_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {new Date(item.specimen_collected_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </div>
        )}

        {isInProgress && !isDoctorView && resultSentBack && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-100">
            <p className="text-xs font-semibold text-red-500 mb-1">
              Result sent back by {item.result_info.status === "lab_admin_rejected" ? "the lab admin" : "the doctor"}. Log the sample again, then upload a new result.
            </p>
            {item.rejection_reason && <p className="text-sm text-red-800">{item.rejection_reason}</p>}
          </div>
        )}

        {isRejected && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
            <p className="text-xs font-semibold text-red-500 mb-1">Reason for rejection:</p>
            <p className="text-sm text-red-800">{item.rejection_reason || "No reason provided."}</p>
          </div>
        )}
      </div>

      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md p-6 flex flex-col items-center gap-4">
            <button onClick={() => setShowAcceptModal(false)} className="self-end -mt-2 -mr-2 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-gray-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-800 text-center">Confirm Test Acceptance</h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed border border-gray-200 rounded-md px-4 py-3">
              By proceeding you confirm that you are ready and capable of proceeding with the test requested. Kindly note that sample collection can be logged in now or later!
            </p>
            <button
              onClick={() => { setFromAccept(true); setShowAcceptModal(false); setShowSampleModal(true); }}
              className="w-full bg-docuhealth-primary text-white text-sm font-medium py-3 rounded-full transition-colors"
            >
              Accept &amp; Log sample collection now
            </button>
            <button
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="w-full border border-docuhealth-primary text-docuhealth-primary text-sm font-medium py-3 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50"
            >
              {acceptMutation.isPending ? "Accepting..." : "Accept & Log sample collection Later"}
            </button>
          </div>
        </div>
      )}

      {showSampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
            <div className="relative flex items-start justify-center">
              <div className="text-center">
                <h3 className="text-base font-semibold text-gray-900">Sample Collection Info</h3>
                <p className="text-sm text-gray-500 mt-1">Kindly fill up to proceed!</p>
              </div>
              <button onClick={() => setShowSampleModal(false)} className="absolute right-0 top-0 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm text-gray-500">Date</label>
                <input
                  type="date"
                  value={sampleDate}
                  onChange={(e) => setSampleDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-docuhealth-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm text-gray-500">Time</label>
                <input
                  type="time"
                  value={sampleTime}
                  onChange={(e) => setSampleTime(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-docuhealth-primary"
                />
              </div>
            </div>

            <button
              onClick={handleSampleSubmit}
              disabled={!sampleDate || !sampleTime || specimenMutation.isPending || acceptMutation.isPending}
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-2.5 rounded-full disabled:opacity-50"
            >
              {(specimenMutation.isPending || acceptMutation.isPending) ? "Saving..." : "Update entry"}
            </button>
          </div>
        </div>
      )}

      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={() => rejectMutation.mutate({ order_sqid: order.id, item_sqid: actualItemSqid, reason: rejectReason })}
        isPending={rejectMutation.isPending}
        value={rejectReason}
        onChange={setRejectReason}
      />

      <DoctorReviewModal
        isOpen={isDoctorReviewModalOpen}
        onClose={() => { setIsDoctorReviewModalOpen(false); setDoctorReviewReason(""); }}
        type={doctorReviewType}
        reason={doctorReviewReason}
        onReasonChange={setDoctorReviewReason}
        isPending={approveMutation.isPending || rejectDoctorMutation.isPending}
        onConfirm={() => {
          if (doctorReviewType === "approve") {
            approveMutation.mutate();
          } else {
            rejectDoctorMutation.mutate();
          }
        }}
      />
    </div>
  );
};

const Hospital_Lab_Test_Detail_Dashboard = ({ 
  orderIdProp, 
  onBackProp, 
  isDoctorView 
} = {}) => {
  const navigate      = useNavigate();
  const queryClient   = useQueryClient();
  const { isLabAdmin = false, hospitalName = "", hospitalLogo = null, profile } = useContext(LabAppContext) || {};
  const { state }     = useLocation() || {};
  const isDirectOrder = typeof orderIdProp === "object" && orderIdProp !== null;
  const sqid          = isDirectOrder ? orderIdProp.sqid : (orderIdProp || state?.sqid || state?.order?.sqid || state?.order?.id);

  const printRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data: fetchedOrder, isLoading: orderLoading } = useQuery({
    queryKey: ["lab-order", sqid],
    queryFn:  () => fetchLabOrderDetail(sqid),
    enabled:  !!sqid && !isDirectOrder,
  });

  const rawData = isDirectOrder ? orderIdProp : (fetchedOrder || state?.order);
  const rawOrder = rawData?.results ? rawData.results[0] : rawData;
  const order = rawOrder ? normalizeOrder(rawOrder, state?.order?.tab || state?.tab) : {};

  const sanitizeForFilename = (str) =>
    String(str || "")
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const patientNameSlug = sanitizeForFilename(order.name || "Patient");
  const testNameSlug = sanitizeForFilename(
    order.items?.[0]?.test_info?.name ||
    order.items?.[0]?.name ||
    "Lab_Test"
  );
  const hospitalNameSlug = sanitizeForFilename(order.hospital || hospitalName || "Hospital");
  const downloadFileName = `${patientNameSlug}_${testNameSlug}_${hospitalNameSlug}.pdf`;

  const hospitalAddress =
    order.hospital_info?.address ||
    order.address ||
    order.hospital_address ||
    profile?.hospital_address ||
    profile?.hospital?.address ||
    profile?.address ||
    "";

  const hospitalEmail =
    order.hospital_info?.email ||
    order.email ||
    order.hospital_email ||
    profile?.hospital_email ||
    profile?.hospital?.email ||
    profile?.email ||
    "";

  // Only results that are ready, lab approved, doctor approved, or completed can be downloaded/printed.
  // Pending, in-progress, sample-collected, or rejected orders CANNOT be downloaded!
  const DOWNLOADABLE_STATUSES = [
    "result_ready",
    "result_accepted_by_lab_admin",
    "result_accepted_by_doctor",
    "completed",
    "accepted",
    "approved",
    "all_ready",
    "ready",
  ];

  const BLOCKED_STATUSES = [
    "pending",
    "in_progress",
    "sample_collected",
    "sample_pending",
    "rejected",
    "declined",
    "cancelled",
  ];

  const orderAggregateStatus = String(order.aggregate_status || "").toLowerCase().trim();
  const rawOrderStatus = String(order.status || "").toLowerCase().trim();
  const orderTab = String(order.tab || state?.order?.tab || state?.tab || "").toLowerCase().trim();

  const isOrderLevelDownloadable =
    DOWNLOADABLE_STATUSES.includes(orderAggregateStatus) ||
    DOWNLOADABLE_STATUSES.includes(rawOrderStatus) ||
    ["result ready", "doctor approved", "lab admin approved", "completed", "result approval"].includes(orderTab);

  const hasDownloadableItem = orderItemsList.some((item) => {
    const itemStatus = String(item.status || "").toLowerCase().trim();
    const resultStatus = String(item.result_info?.status || "").toLowerCase().trim();

    // If item status or result status is explicitly in DOWNLOADABLE_STATUSES, it is downloadable
    if (DOWNLOADABLE_STATUSES.includes(itemStatus) || DOWNLOADABLE_STATUSES.includes(resultStatus)) {
      return true;
    }

    // If item is pending, in_progress, or sample_collected, and result status is not ready, block it!
    if (BLOCKED_STATUSES.includes(itemStatus) || BLOCKED_STATUSES.includes(resultStatus)) {
      return false;
    }

    // Check if result_info contains actual entered values and is not in a blocked status
    if (item.result_info) {
      const val = item.result_info.value;
      const hasValue = val != null && String(val).trim() !== "";
      const hasParams =
        Array.isArray(item.result_info.parameters) &&
        item.result_info.parameters.some((p) => p.value != null && String(p.value).trim() !== "");
      const hasParamsInfo =
        Array.isArray(item.result_info.parameters_info) &&
        item.result_info.parameters_info.some((p) => p.value != null && String(p.value).trim() !== "");
      return hasValue || hasParams || hasParamsInfo;
    }

    return false;
  });

  // If order status is explicitly pending or in_progress, it MUST have at least one item ready to download; otherwise strictly blocked!
  const isOrderBlocked =
    (rawOrderStatus === "pending" || rawOrderStatus === "in_progress" || rawOrderStatus === "sample_collected") &&
    !hasDownloadableItem;

  const hasResultToExport = !isOrderBlocked && (isOrderLevelDownloadable || hasDownloadableItem);

  const handlePrint = () => {
    if (!hasResultToExport) {
      toast.error("Results are not ready for printing.");
      return;
    }
    printElement(printRef.current, `Lab Record - ${order.name || "Patient"}`).catch(() =>
      toast.error("Could not open the print dialog")
    );
  };

  // The PDF holds every result in the order, so log one audit entry per result; never blocks the download
  const logDownloads = () => {
    // Only lab staff may log downloads; the backend 403s doctors since 2026-10-17
    if (isDoctorView) return;
    const resultSqids = [...new Set((order.items || []).map((it) => it.result_info?.sqid).filter(Boolean))];
    if (!resultSqids.length) return;
    Promise.allSettled(resultSqids.map((sqid) => logLabResultDownload(sqid))).then((outcomes) => {
      outcomes.filter((o) => o.status === "rejected").forEach((o) => console.warn("Download audit log failed", o.reason));
      queryClient.invalidateQueries({ queryKey: ["lab-audit-logs"] });
    });
  };

  const handleDownload = async () => {
    if (downloading || !printRef.current) return;
    if (!hasResultToExport) {
      toast.error("Results are not ready for download.");
      return;
    }

    // Option 1: Fire download audit immediately so mobile canvas limitations never omit audit logs
    logDownloads();

    setDownloading(true);
    const toastId = toast.loading("Preparing PDF...");
    try {
      await downloadElementAsPdf(printRef.current, downloadFileName, { scale: 2, margin: 0 });
      toast.success("PDF downloaded", { id: toastId });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Could not generate the PDF", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  // Tests still waiting for the lab admin; approving/rejecting already-reviewed ones would 400
  const itemsAwaitingLabAdmin = (order.items || []).filter((i) => i.status === "result_ready");
  // Single tests are reviewed on their own card; the order-level buttons only batch several
  const isApprovalView = !isDoctorView && isLabAdmin && itemsAwaitingLabAdmin.length > 1;

  const approveMutation = useMutation({
    mutationFn: async () => {
      const items = itemsAwaitingLabAdmin;
      if (Array.isArray(items) && items.length > 0) {
        await Promise.all(
          items.map((i) => approveLabTestResultByLabAdmin({ item_sqid: i.sqid || i.id }))
        );
      } else if (order.id || sqid) {
        await approveLabTestResultByLabAdmin({ item_sqid: order.id || sqid });
      }
    },
    onSuccess: () => {
      setIsAcceptModalOpen(false);
      setIsSuccessModalOpen(true);
      queryClient.invalidateQueries({ queryKey: ["lab-requests"] });
      queryClient.invalidateQueries({ queryKey: ["lab-order"] });
      queryClient.invalidateQueries({ queryKey: ["lab-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["lab-audit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-lab-records"] });
      queryClient.invalidateQueries({ queryKey: ["patient-lab-records"] });
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to approve test result"));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (reason) => {
      const items = itemsAwaitingLabAdmin;
      if (Array.isArray(items) && items.length > 0) {
        await Promise.all(
          items.map((i) =>
            rejectLabTestResultByLabAdmin({
              item_sqid: i.sqid || i.id,
              rejection_reason: reason.trim(),
            })
          )
        );
      } else if (order.id || sqid) {
        await rejectLabTestResultByLabAdmin({
          item_sqid: order.id || sqid,
          rejection_reason: reason.trim(),
        });
      }
    },
    onSuccess: () => {
      setIsRejectModalOpen(false);
      setRejectReason("");
      toast.success("Test result rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["lab-requests"] });
      queryClient.invalidateQueries({ queryKey: ["lab-order"] });
      queryClient.invalidateQueries({ queryKey: ["lab-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["lab-audit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-lab-records"] });
      queryClient.invalidateQueries({ queryKey: ["patient-lab-records"] });
      if (onBackProp) onBackProp();
      else navigate(-1);
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to reject test result"));
    },
  });

  const hasOrderData = !!(order.name || (order.items && order.items.length > 0));
  if (orderLoading && !isDirectOrder && !hasOrderData) {
    return (
      <>
        <div className="py-2">
          <DynamicDate />
        </div>
        <div className="mt-4 bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between animate-pulse">
          <div className="h-4 w-36 bg-gray-200 rounded" />
          <div className="h-8 w-24 bg-gray-100 rounded-full" />
        </div>
        <div className="mt-4 bg-white border border-gray-200 rounded-xl px-6 py-5 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-28 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-4 animate-pulse">
          <div className="h-5 w-28 bg-gray-200 rounded mb-3" />
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <div className="h-4 w-36 bg-gray-200 rounded" />
              <div className="h-6 w-20 bg-gray-200 rounded-full" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-5/6 bg-gray-100 rounded" />
              <div className="h-4 w-2/3 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="py-2" data-print-hide>
        <DynamicDate />
      </div>

      <div data-print-hide className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          onClick={() => onBackProp ? onBackProp() : navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-docuhealth-primary transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft size={16} />
          Lab Order Details
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Print & Download buttons (available once result is ready/available, only on Lab dashboard) */}
          {hasResultToExport && !isDoctorView && (
            <>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full py-1.5 px-3.5 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Eye size={14} />
                Preview Record
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center justify-center gap-1.5 border border-docuhealth-primary bg-docuhealth-primary text-white hover:bg-docuhealth-primary/90 rounded-full py-1.5 px-4 text-xs font-semibold cursor-pointer transition-colors disabled:opacity-60"
              >
                <Download size={14} />
                {downloading ? "Downloading..." : "Download"}
              </button>
            </>
          )}

          {isApprovalView && (
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => { setRejectReason(""); setIsRejectModalOpen(true); }}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="w-full sm:w-auto border border-red-500 text-red-500 hover:bg-red-50 text-xs font-semibold px-6 py-1.5 rounded-full transition-colors disabled:opacity-50 cursor-pointer text-center"
              >
                Reject all
              </button>
              <button
                onClick={() => setIsAcceptModalOpen(true)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="w-full sm:w-auto border border-docuhealth-primary text-docuhealth-primary hover:bg-indigo-50 text-xs font-semibold px-6 py-1.5 rounded-full transition-colors disabled:opacity-50 cursor-pointer text-center"
              >
                Accept all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dedicated Export Container: Rendered at exact 794px A4 pixel width off-screen so html2canvas and print dialog capture full A4 width without shrinking */}
      <div
        style={{
          position: "fixed",
          left: "-99999px",
          top: 0,
          width: "794px",
          zIndex: -9999,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <div ref={printRef} className="w-[794px] bg-white text-slate-900 p-0 m-0">
          <LabOfficialReportTemplate
            order={order}
            hospitalName={hospitalName}
            hospitalLogo={hospitalLogo}
            hospitalAddress={hospitalAddress}
            hospitalEmail={hospitalEmail}
          />
        </div>
      </div>

      {/* On-screen Dashboard View */}
      <div className="on-screen-lab-dashboard">
          {order.hin && order.hin !== "—" && (
            <div data-pdf-unit className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5">
              {/* At lg the content column is only ~720px (256px sidebar + padding),
                  so 4 tracks get cramped — hold the 4th back to xl, matching
                  PatientInfoCard. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400">Patient</p>
                  <p className="text-sm font-bold text-docuhealth-dark">{order.name || "—"}</p>
                  <p className="text-xs text-gray-500">HIN: {maskHin(order.hin)}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400">Age / Gender</p>
                  <p className="text-sm font-semibold text-docuhealth-dark capitalize">
                    {[calcAge(order.dob), order.gender].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                {order.requestedBy && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-gray-400">
                      {isDoctorView ? "Result submitted by" : "Requested by"}
                    </p>
                    <p className="text-sm font-semibold text-docuhealth-dark">{order.requestedBy}</p>
                  </div>
                )}
                {order.datetime && order.datetime !== "—" && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-gray-400">
                      {isDoctorView ? "Result date" : "Requested"}
                    </p>
                    <p className="text-sm font-semibold text-docuhealth-dark">{order.datetime}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Test Items</h2>
            {order.items?.map((item) => (
              <LabTestItem 
                key={item.sqid} 
                order={order} 
                item={item} 
                isDoctorView={isDoctorView} 
                isLabAdmin={isLabAdmin}
                queryClient={queryClient} 
              />
            ))}
            {orderLoading ? (
              <div className="flex items-center gap-2 py-6 text-sm text-gray-500" data-print-hide>
                <div className="w-4 h-4 border-2 border-docuhealth-primary border-t-transparent rounded-full animate-spin" />
                <span>Loading test items...</span>
              </div>
            ) : (!order.items || order.items.length === 0) ? (
              <p className="text-sm text-gray-500 py-4">No test items found for this order.</p>
            ) : null}
          </div>
        </div>

      {/* Accept Confirmation Modal */}
      <AcceptApprovalModal
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        onConfirm={() => approveMutation.mutate()}
        isPending={approveMutation.isPending}
      />

      {/* Success Modal */}
      <ApprovalSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          if (onBackProp) onBackProp();
          else navigate(-1);
        }}
      />

      {/* Reject Modal */}
      <RejectApprovalModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={() => {
          if (!rejectReason.trim()) {
            return toast.error("Please provide a reason for rejection");
          }
          rejectMutation.mutate(rejectReason);
        }}
        isPending={rejectMutation.isPending}
        reason={rejectReason}
        onReasonChange={setRejectReason}
      />

      {/* ── Official Record Preview Modal ── */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPreviewOpen(false);
          }}
        >
          <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header bar (Pinned at top) */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-gray-200 bg-gray-50/95 shrink-0 z-20">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-sm text-gray-800">
                  Lab Record Preview
                </span>
                <span className="text-[11px] bg-indigo-50 text-docuhealth-primary font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100/60">
                  A4 Portrait · Exact 1:1 Export Scale
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-1.5 bg-docuhealth-primary text-white hover:bg-docuhealth-dark-primary px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors disabled:opacity-60"
                >
                  <Download size={13} /> {downloading ? "Downloading..." : "Download PDF"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="w-8 h-8 rounded-full bg-white text-gray-500 hover:text-gray-800 border border-gray-200 flex items-center justify-center ml-1 cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable preview body: flex-1 min-h-0 guarantees smooth vertical scrolling across all screen heights */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto p-4 sm:p-6 bg-slate-200/90 flex justify-center">
              {/* Authentic A4 Paper Sheet: EXACT 794px width matching download export container */}
              <div className="w-[794px] min-w-[794px] bg-white border border-gray-300 p-0 m-0 shrink-0 select-text my-auto sm:my-2 shadow-sm">
                <LabOfficialReportTemplate
                  order={order}
                  hospitalName={hospitalName}
                  hospitalLogo={hospitalLogo}
                  hospitalAddress={hospitalAddress}
                  hospitalEmail={hospitalEmail}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Hospital_Lab_Test_Detail_Dashboard;
