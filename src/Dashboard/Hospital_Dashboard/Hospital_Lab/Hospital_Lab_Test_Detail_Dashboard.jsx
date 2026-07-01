import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { ArrowLeft, Printer, Download, Calendar, Clock, X } from "lucide-react";
import PatientInfoCard from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/PatientInfoCard";
import RejectModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/RejectModal";
import toast from "react-hot-toast";
import {
  fetchLabOrderDetail,
  acceptLabRequest,
  rejectLabRequest,
  logSpecimenCollectionTime,
  approveLabTestResult,
  rejectLabTestResult,
} from "../../../queries/Hospital/lab/requests";
import DoctorReviewModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/DoctorReviewModal";

const STATUS_STYLES = {
  pending:     { label: "Pending",     color: "text-amber-500" },
  in_progress: { label: "In Progress", color: "text-amber-500" },
  completed:   { label: "Completed",   color: "text-green-600" },
  rejected:    { label: "Rejected",    color: "text-red-500"   },
  approved:    { label: "Approved",    color: "text-green-600" },
  accepted:    { label: "Accepted",    color: "text-green-600" },
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

const ParamIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.6654 12.834H10.4987V11.6673C10.4987 10.7008 9.71522 9.91732 8.7487 9.91732H5.2487C4.2822 9.91732 3.4987 10.7008 3.4987 11.6673V12.834H2.33203V11.6673C2.33203 10.0565 3.63787 8.75065 5.2487 8.75065H8.7487C10.3595 8.75065 11.6654 10.0565 11.6654 11.6673V12.834ZM6.9987 7.58398C5.0657 7.58398 3.4987 6.01698 3.4987 4.08398C3.4987 2.15099 5.0657 0.583984 6.9987 0.583984C8.93169 0.583984 10.4987 2.15099 10.4987 4.08398C10.4987 6.01698 8.93169 7.58398 6.9987 7.58398ZM6.9987 6.41732C8.28734 6.41732 9.33203 5.37265 9.33203 4.08398C9.33203 2.79532 8.28734 1.75065 6.9987 1.75065C5.71003 1.75065 4.66536 2.79532 4.66536 4.08398C4.66536 5.37265 5.71003 6.41732 6.9987 6.41732Z" fill="#647284" />
  </svg>
);

const normalizeOrder = (raw, tab) => ({
  id:                    raw.sqid,
  name:                  [raw.patient_info?.firstname, raw.patient_info?.lastname].filter(Boolean).join(" ") || "Unknown",
  hin:                   raw.patient_info?.hin || "—",
  test:                  raw.test_info?.name || "—",
  hospital:              raw.hospital_info?.name || "—",
  datetime:              raw.created_at
    ? new Date(raw.created_at).toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—",
  tab,
  requestedBy:           raw.ordered_by
    ? `${raw.ordered_by.role === "doctor" ? "Dr. " : ""}${raw.ordered_by.firstname || ""} ${raw.ordered_by.lastname || ""}`.trim()
    : undefined,
  gender:                raw.patient_info?.gender,
  dob:                   raw.patient_info?.dob,
  payment_category:      raw.patient_info?.payment_category,
  email:                 raw.hospital_info?.email,
  status:                raw.status,
  note:                  raw.note,
  test_info:             raw.test_info,
  result_info:           raw.result_info,
  rejection_reason:      raw.rejection_reason,
  specimen_collected_at: raw.specimen_collected_at,
});

/* ─── main component ─── */
const Hospital_Lab_Test_Detail_Dashboard = ({ 
  orderIdProp, 
  onBackProp, 
  isDoctorView 
} = {}) => {
  const navigate      = useNavigate();
  const queryClient   = useQueryClient();
  const { state }     = useLocation() || {};
  const isDirectOrder = typeof orderIdProp === "object" && orderIdProp !== null;
  const sqid          = isDirectOrder ? orderIdProp.sqid : (orderIdProp || state?.sqid);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDoctorReviewModalOpen, setIsDoctorReviewModalOpen] = useState(false);
  const [doctorReviewType, setDoctorReviewType] = useState("approve");

  const { data: fetchedOrder, isLoading: orderLoading } = useQuery({
    queryKey: ["lab-order", sqid],
    queryFn:  () => fetchLabOrderDetail(sqid),
    enabled:  !!sqid && !isDirectOrder,
  });

  const rawOrder = isDirectOrder ? orderIdProp : fetchedOrder;
  const order = rawOrder ? normalizeOrder(rawOrder, state?.order?.tab) : (state?.order ?? {});

  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [fromAccept, setFromAccept] = useState(false);
  const [sampleLogged, setSampleLogged] = useState(!!order.specimen_collected_at);
  const [sampleDate, setSampleDate] = useState("");
  const [sampleTime, setSampleTime] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const displayStatus = isDoctorView && order?.result_info?.status ? order.result_info.status : order.status;
  const statusStyle  = STATUS_STYLES[displayStatus] ?? STATUS_STYLES.pending;
  const isPending    = order.status === "pending";
  const isInProgress = order.status === "in_progress";
  const isCompleted  = order.status === "completed";
  const isRejected   = order.status === "rejected";

  const specimens    = order.test_info?.specimens ?? [];
  const preferredSpecimen = specimens.find((s) => s.is_preferred) ?? specimens[0];
  const specimenLabel = preferredSpecimen
    ? `${preferredSpecimen.name}${preferredSpecimen.container ? ` (${preferredSpecimen.container})` : ""}`
    : "—";

  const resultParams = order.result_info?.parameters ?? (order.test_info?.parameters || []).map(p => ({
    parameter_info: p,
    value: null,
    status: null
  }));

  const headerLabel = isCompleted || isRejected ? "Lab result" : "Test";

  const acceptMutation = useMutation({ 
    mutationFn: () => acceptLabRequest(order.id),
    onSuccess: () => {
      toast.success("Request accepted — moved to In-progress");
      setShowAcceptModal(false);
      queryClient.invalidateQueries(["labRequests"]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to accept request");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectLabRequest,
    onSuccess: () => {
      toast.success("Request rejected successfully!");
      setIsRejectModalOpen(false);
      queryClient.invalidateQueries(["labOrderDetail", sqid]);
      queryClient.invalidateQueries(["labRequests"]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to reject request");
    },
  });

  const specimenMutation = useMutation({ mutationFn: (data) => logSpecimenCollectionTime(data) });

  const approveMutation = useMutation({
    mutationFn: approveLabTestResult,
    onSuccess: () => {
      toast.success("Result approved successfully!");
      setIsDoctorReviewModalOpen(false);
      queryClient.invalidateQueries(["patient-lab-records"]);
      queryClient.invalidateQueries(["labOrderDetail", sqid]);
      queryClient.invalidateQueries(["labRequests"]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to approve result");
    },
  });

  const rejectDoctorMutation = useMutation({
    mutationFn: rejectLabTestResult,
    onSuccess: () => {
      toast.success("Result rejected successfully!");
      setIsDoctorReviewModalOpen(false);
      queryClient.invalidateQueries(["patient-lab-records"]);
      queryClient.invalidateQueries(["labOrderDetail", sqid]);
      queryClient.invalidateQueries(["labRequests"]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to reject result");
    },
  });

  const handleSampleSubmit = async () => {
    const specimen_collected_at = `${sampleDate}T${sampleTime}:00`;
    try {
      if (fromAccept) {
        await acceptMutation.mutateAsync();
        toast.success("Request accepted");
      }
      await specimenMutation.mutateAsync({ sqid: order.id, specimen_collected_at });
      toast.success(fromAccept ? "Sample collection logged" : "Sample collection updated");
      setShowSampleModal(false);
      setSampleLogged(true);
      if (fromAccept) {
        navigate(-1);
      } else {
        queryClient.invalidateQueries({ queryKey: ["lab-order", sqid] });
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (orderLoading && !isDirectOrder) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        <div className="w-5 h-5 border-2 border-[#3E4095] border-t-transparent rounded-full animate-spin mr-3" />
        Loading order...
      </div>
    );
  }

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          onClick={() => onBackProp ? onBackProp() : navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#3E4095] transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          {headerLabel}
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-0">
            Status:{" "}
            <span className={`font-semibold ${statusStyle.color}`}>{statusStyle.label}</span>
          </p>

          {isPending && !isDoctorView && (
            <>
              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
                className="w-full sm:w-auto border border-red-400 text-red-500 text-xs font-medium px-4 sm:px-5 py-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Reject request
              </button>
              <button
                onClick={() => setShowAcceptModal(true)}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
                className="w-full sm:w-auto border border-[#3E4095] text-[#3E4095] text-xs font-medium px-4 sm:px-5 py-2 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              >
                Accept request
              </button>
            </>
          )}

          {isInProgress && !isDoctorView && (
            <>
              <button
                onClick={() => setShowSampleModal(true)}
                className="w-full sm:w-auto border border-[#3E4095] text-[#3E4095] text-xs font-medium px-4 sm:px-5 py-2.5 rounded-full hover:bg-indigo-50 transition-colors"
              >
                {sampleLogged ? "Edit sample collection info" : "Log sample collection"}
              </button>
              <button
                onClick={() => navigate("/hospital-lab-upload-result", { state: { order } })}
                disabled={!sampleLogged}
                className="w-full sm:w-auto bg-[#3E4095] text-white text-xs font-medium px-4 sm:px-5 py-2.5 rounded-full hover:bg-[#2e3070] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Upload test result
              </button>
            </>
          )}

          {isCompleted && isDoctorView && (
            <>
              <button
                onClick={() => {
                  setDoctorReviewType("reject");
                  setIsDoctorReviewModalOpen(true);
                }}
                className="w-full sm:w-44 border border-red-500 text-red-500 text-xs font-medium px-4 sm:px-6 py-2.5 rounded-full hover:bg-red-50 transition-colors flex items-center justify-center"
              >
                Reject result
              </button>
              <button
                onClick={() => {
                  setDoctorReviewType("approve");
                  setIsDoctorReviewModalOpen(true);
                }}
                className="w-full sm:w-44 bg-[#3E4095] text-white text-xs font-medium px-4 sm:px-6 py-2.5 rounded-full hover:bg-[#2e3070] transition-colors flex items-center justify-center"
              >
                Accept result
              </button>
            </>
          )}
        </div>
      </div>

      <PatientInfoCard
        order={order}
        isCompleted={isCompleted}
        isRejected={isRejected}
        isInProgress={isInProgress}
        onEditSample={() => setShowSampleModal(true)}
      />

      {isPending && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5 flex flex-col gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Test requested:</p>
            <p className="text-sm font-semibold text-teal-600">{order.test}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Specimen needed:</p>
            <p className="text-sm font-semibold text-[#3E4095]">{specimenLabel}</p>
          </div>
          {order.test_info?.special_instructions && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Special instructions:</p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{order.test_info.special_instructions}</p>
            </div>
          )}
          {order.note && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Note:</p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{order.note}</p>
            </div>
          )}
        </div>
      )}

      {isInProgress && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5 flex flex-col gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Test requested:</p>
            <p className="text-sm font-semibold text-teal-600">{order.test}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Specimen needed:</p>
            <p className="text-sm font-semibold text-[#3E4095]">{specimenLabel}</p>
          </div>
          {order.note && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Note:</p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{order.note}</p>
            </div>
          )}
        </div>
      )}

      {isCompleted && (
        <>
          {resultParams.length > 0 && (
            <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5">
              <p className="text-sm font-bold text-gray-800 mb-4 sm:mb-6">{order.test}</p>
              <div className="hidden lg:block overflow-x-auto">
                <div className="min-w-[600px] flex flex-col">
                  <div className="grid grid-cols-4 text-left text-sm font-semibold text-gray-700 bg-[#F8F9FA] py-4 px-6 rounded-full mb-2 border border-gray-200">
                    <p>Test</p>
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
                      <div key={i} className={`grid grid-cols-4 items-center text-sm text-gray-600 py-4 px-6 ${isLast ? "" : "border-b border-gray-200"}`}>
                        <p>{info.name}</p>
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

              <div className="lg:hidden flex flex-col gap-4 mt-2">
                {resultParams.map((p, i) => {
                  const info = p.parameter_info;
                  const paramStatus = p.status ?? getParamStatus(p.value, info);
                  const statusText = paramStatus ?? "—";
                  const statusLower = statusText.toLowerCase();
                  const isRed = statusLower === "negative" || statusLower === "abnormal";
                  const isGreen = statusLower === "positive" || statusLower === "normal";

                  return (
                    <div key={i} className="bg-white border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-gray-800 font-bold text-sm">
                          {info.name}
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-md border font-medium uppercase tracking-wider ${
                          isGreen ? "bg-green-50 text-green-600 border-green-100"
                          : isRed ? "bg-red-50 text-red-500 border-red-100"
                          : "bg-gray-50 text-gray-500 border-gray-100"
                        }`}>
                          {statusText}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-y-4 pt-3 border-t border-gray-50">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-medium mb-1">Result</p>
                          <p className="text-sm font-medium text-gray-700">
                            {p.value ?? "—"} {info.unit || ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-medium mb-1">Reference Range</p>
                          <p className="text-sm font-medium text-gray-700">
                            {getRefRange(info)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5 flex flex-col gap-5">
            {order.result_info?.interpretation && (
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-2">Interpretation:</p>
                <p className="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-line">
                  {order.result_info.interpretation}
                </p>
              </div>
            )}
            {order.result_info?.clinical_correlation && (
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-2">Clinical correlation:</p>
                <p className="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-line">
                  {order.result_info.clinical_correlation}
                </p>
              </div>
            )}
            {order.result_info?.comments && (
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-2">Comments:</p>
                <p className="text-sm font-medium text-gray-800 leading-relaxed">{order.result_info.comments}</p>
              </div>
            )}
          </div>

          {order.specimen_collected_at && (
            <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5">
              <p className="text-sm font-semibold text-[#1B2B40] mb-4">Date collected</p>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date:</p>
                  <p className="text-sm font-medium text-[#1B2B40]">
                    {new Date(order.specimen_collected_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Time:</p>
                  <p className="text-sm font-medium text-[#1B2B40]">
                    {new Date(order.specimen_collected_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {isRejected && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5">
          <p className="text-xs sm:text-sm font-semibold text-red-500 mb-2">Reason for rejection (note):</p>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{order.rejection_reason || "No reason provided."}</p>
        </div>
      )}

      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md p-6 flex flex-col items-center gap-4">
            <button
              onClick={() => setShowAcceptModal(false)}
              className="self-end -mt-2 -mr-2 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
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
              className="w-full bg-[#3E4095] text-white text-sm font-medium py-3 rounded-full border border-transparent transition-colors"
            >
              Accept &amp; Log sample collection now
            </button>
            <button
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="w-full border border-[#3E4095] text-[#3E4095] text-sm font-medium py-3 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {acceptMutation.isPending ? (
                <><div className="w-3 h-3 border-2 border-[#3E4095] border-t-transparent rounded-full animate-spin" /> Accepting...</>
              ) : "Accept & Log sample collection Later"}
            </button>
          </div>
        </div>
      )}

      {showSampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
            <div className="relative flex items-start justify-center">
              <div className="text-center">
                <h3 className="text-base font-semibold text-gray-900">Edit Sample Collection Info</h3>
                <p className="text-sm text-gray-500 mt-1">Kindly fill up to proceed!</p>
              </div>
              <button
                onClick={() => setShowSampleModal(false)}
                className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-500">Patient Name</label>
              <input
                type="text"
                readOnly
                value={order.name ?? ""}
                className="border-b border-gray-300 pb-2 text-sm text-gray-400 bg-transparent outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-500">Test Requested</label>
              <input
                type="text"
                readOnly
                value={order.test ?? ""}
                className="border-b border-gray-300 pb-2 text-sm text-gray-400 bg-transparent outline-none"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm text-gray-500">New sample collection date</label>
                <input
                  type="date"
                  value={sampleDate}
                  onChange={(e) => setSampleDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white outline-none w-full focus:border-[#3E4095] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm text-gray-500">New sample Collection Time</label>
                <input
                  type="time"
                  value={sampleTime}
                  onChange={(e) => setSampleTime(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white outline-none w-full focus:border-[#3E4095] transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handleSampleSubmit}
              disabled={!sampleDate || !sampleTime || specimenMutation.isPending || acceptMutation.isPending}
              className="w-full bg-[#3E4095] text-white text-sm font-semibold py-2.5 rounded-full transition-colors disabled:opacity-50"
            >
              {(specimenMutation.isPending || acceptMutation.isPending) ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...
                </span>
              ) : "Update entry!"}
            </button>
          </div>
        </div>
      )}

      {/* Reject modal for lab requests */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={(reason) => rejectMutation.mutate({ sqid, reason })}
        isSubmitting={rejectMutation.isPending}
      />

      {/* Approve/Reject modal for doctors */}
      <DoctorReviewModal
        isOpen={isDoctorReviewModalOpen}
        onClose={() => setIsDoctorReviewModalOpen(false)}
        type={doctorReviewType}
        isPending={approveMutation.isPending || rejectDoctorMutation.isPending}
        onConfirm={() => {
          if (doctorReviewType === "approve") {
            approveMutation.mutate(sqid);
          } else {
            rejectDoctorMutation.mutate(sqid);
          }
        }}
      />
    </>
  );
};

export default Hospital_Lab_Test_Detail_Dashboard;
