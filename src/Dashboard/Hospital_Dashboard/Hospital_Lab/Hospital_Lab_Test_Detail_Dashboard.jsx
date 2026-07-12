import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { ArrowLeft, X } from "lucide-react";
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
  pending:          { label: "Pending",     color: "text-green-600" },
  sample_collected: { label: "Sample Collected", color: "text-blue-600" },
  in_progress:      { label: "In Progress", color: "text-amber-600" },
  result_ready:     { label: "Result Ready", color: "text-green-600" },
  completed:        { label: "Completed",   color: "text-green-600" },
  rejected:         { label: "Rejected",    color: "text-red-500"   },
  approved:         { label: "Approved",    color: "text-green-600" },
  accepted:         { label: "Accepted",    color: "text-green-600" },
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
  id:                    raw.sqid,
  name:                  [raw.patient_info?.firstname, raw.patient_info?.lastname].filter(Boolean).join(" ") || "Unknown",
  hin:                   raw.patient_info?.hin || "—",
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
  aggregate_status:      raw.aggregate_status,
  items:                 raw.items || [],
});

const LabTestItem = ({ order, item, isDoctorView, queryClient }) => {
  const navigate = useNavigate();
  
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDoctorReviewModalOpen, setIsDoctorReviewModalOpen] = useState(false);
  const [doctorReviewType, setDoctorReviewType] = useState("approve");

  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [fromAccept, setFromAccept] = useState(false);
  const [sampleLogged, setSampleLogged] = useState(!!item.specimen_collected_at);
  const [sampleDate, setSampleDate] = useState("");
  const [sampleTime, setSampleTime] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const displayStatus = isDoctorView && item.result_info?.status ? item.result_info.status : item.status;
  const statusStyle  = STATUS_STYLES[displayStatus] ?? STATUS_STYLES.pending;
  
  const isPending    = item.status === "pending";
  const isSampleCollected = item.status === "sample_collected";
  const isInProgress = item.status === "in_progress";
  const isResultReady  = item.status === "result_ready" || item.status === "completed";
  const isRejected   = item.status === "rejected";

  const specimens    = item.test_info?.specimens ?? [];
  const preferredSpecimen = specimens.find((s) => s.is_preferred) ?? specimens[0];
  const specimenLabel = preferredSpecimen
    ? `${preferredSpecimen.name}${preferredSpecimen.container ? ` (${preferredSpecimen.container})` : ""}`
    : "—";

  const resultParams = item.result_info?.parameters ?? (item.test_info?.parameters || []).map(p => ({
    parameter_info: p,
    value: null,
    status: null
  }));

  const acceptMutation = useMutation({ 
    mutationFn: () => acceptLabRequest({ order_sqid: order.id, item_sqid: item.sqid }),
    onSuccess: () => {
      toast.success("Request accepted — moved to Sample Collected");
      setShowAcceptModal(false);
      queryClient.invalidateQueries(["labRequests"]);
      queryClient.invalidateQueries(["lab-order", order.id]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to accept request");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (data) => rejectLabRequest(data),
    onSuccess: () => {
      toast.success("Request rejected successfully!");
      setIsRejectModalOpen(false);
      queryClient.invalidateQueries(["lab-order", order.id]);
      queryClient.invalidateQueries(["labRequests"]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to reject request");
    },
  });

  const specimenMutation = useMutation({ 
    mutationFn: (data) => logSpecimenCollectionTime(data) 
  });

  const approveMutation = useMutation({
    mutationFn: () => approveLabTestResult({ order_sqid: order.id, item_sqid: item.sqid }),
    onSuccess: () => {
      toast.success("Result approved successfully!");
      setIsDoctorReviewModalOpen(false);
      queryClient.invalidateQueries(["patient-lab-records"]);
      queryClient.invalidateQueries(["lab-order", order.id]);
      queryClient.invalidateQueries(["labRequests"]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to approve result");
    },
  });

  const rejectDoctorMutation = useMutation({
    mutationFn: () => rejectLabTestResult({ order_sqid: order.id, item_sqid: item.sqid }),
    onSuccess: () => {
      toast.success("Result rejected successfully!");
      setIsDoctorReviewModalOpen(false);
      queryClient.invalidateQueries(["patient-lab-records"]);
      queryClient.invalidateQueries(["lab-order", order.id]);
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
      await specimenMutation.mutateAsync({ order_sqid: order.id, item_sqid: item.sqid, specimen_collected_at });
      toast.success(fromAccept ? "Sample collection logged" : "Sample collection updated");
      setShowSampleModal(false);
      setSampleLogged(true);
      queryClient.invalidateQueries(["lab-order", order.id]);
      queryClient.invalidateQueries(["labRequests"]);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#1B2B40]">{item.test_info?.name || "Unknown Test"}</h3>
          <p className="text-xs font-medium text-gray-500 mt-1">
            Status: <span className={`font-semibold ${statusStyle.color}`}>{statusStyle.label}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          {isPending && !isDoctorView && (
            <>
              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
                className="w-full sm:w-auto border border-red-400 text-red-500 text-xs font-medium px-4 py-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => setShowAcceptModal(true)}
                disabled={acceptMutation.isPending || rejectMutation.isPending}
                className="w-full sm:w-auto border border-[#3E4095] text-[#3E4095] text-xs font-medium px-4 py-2 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50"
              >
                Accept
              </button>
            </>
          )}

          {(isSampleCollected || isInProgress) && !isDoctorView && (
            <>
              <button
                onClick={() => setShowSampleModal(true)}
                className="w-full sm:w-auto border border-[#3E4095] text-[#3E4095] text-xs font-medium px-4 py-2 rounded-full hover:bg-indigo-50 transition-colors"
              >
                {sampleLogged ? "Edit sample" : "Log sample"}
              </button>
              <button
                onClick={() => navigate("/hospital-lab-upload-result", { state: { order, item } })}
                disabled={!sampleLogged}
                className="w-full sm:w-auto bg-[#3E4095] text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-[#2e3070] transition-colors disabled:opacity-40"
              >
                Upload result
              </button>
            </>
          )}

          {isResultReady && isDoctorView && (
            <>
              <button
                onClick={() => { setDoctorReviewType("reject"); setIsDoctorReviewModalOpen(true); }}
                disabled={displayStatus === "rejected" || displayStatus === "accepted" || displayStatus === "approved"}
                className={`w-full sm:w-auto border text-xs font-medium px-4 py-2 rounded-full transition-colors ${
                  displayStatus === "rejected" || displayStatus === "accepted" || displayStatus === "approved"
                    ? "border-red-200 text-red-300 cursor-not-allowed" : "border-red-500 text-red-500 hover:bg-red-50"
                }`}
              >
                Reject result
              </button>
              <button
                onClick={() => { setDoctorReviewType("approve"); setIsDoctorReviewModalOpen(true); }}
                disabled={displayStatus === "rejected" || displayStatus === "accepted" || displayStatus === "approved"}
                className={`w-full sm:w-auto text-xs font-medium px-4 py-2 rounded-full transition-colors ${
                  displayStatus === "rejected" || displayStatus === "accepted" || displayStatus === "approved"
                    ? "bg-[#b1b2d4] text-white cursor-not-allowed" : "bg-[#3E4095] text-white hover:bg-[#2e3070]"
                }`}
              >
                Accept result
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white px-4 sm:px-6 py-5 flex flex-col gap-4">
        {(isPending || isSampleCollected || isInProgress) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Specimen needed:</p>
              <p className="text-sm font-semibold text-[#3E4095]">{specimenLabel}</p>
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

        {isResultReady && (
          <div className="flex flex-col gap-5">
            {resultParams.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-800 mb-4">Results</p>
                <div className="hidden lg:block overflow-x-auto">
                  <div className="min-w-[600px] flex flex-col border border-gray-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-4 text-left text-sm font-semibold text-gray-700 bg-[#F8F9FA] py-3 px-4 border-b border-gray-200">
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
            {isInProgress && !isDoctorView && (
              <button onClick={() => setShowSampleModal(true)} className="text-blue-600 text-xs font-medium hover:underline">
                Edit
              </button>
            )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
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
              className="w-full bg-[#3E4095] text-white text-sm font-medium py-3 rounded-full transition-colors"
            >
              Accept &amp; Log sample collection now
            </button>
            <button
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="w-full border border-[#3E4095] text-[#3E4095] text-sm font-medium py-3 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50"
            >
              {acceptMutation.isPending ? "Accepting..." : "Accept & Log sample collection Later"}
            </button>
          </div>
        </div>
      )}

      {showSampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
            <div className="relative flex items-start justify-center">
              <div className="text-center">
                <h3 className="text-base font-semibold text-gray-900">{fromAccept ? "Sample Collection Info" : "Edit Sample Collection Info"}</h3>
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
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3E4095]"
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm text-gray-500">Time</label>
                <input
                  type="time"
                  value={sampleTime}
                  onChange={(e) => setSampleTime(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3E4095]"
                />
              </div>
            </div>

            <button
              onClick={handleSampleSubmit}
              disabled={!sampleDate || !sampleTime || specimenMutation.isPending || acceptMutation.isPending}
              className="w-full bg-[#3E4095] text-white text-sm font-semibold py-2.5 rounded-full disabled:opacity-50"
            >
              {(specimenMutation.isPending || acceptMutation.isPending) ? "Saving..." : "Update entry"}
            </button>
          </div>
        </div>
      )}

      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={() => rejectMutation.mutate({ order_sqid: order.id, item_sqid: item.sqid, reason: rejectReason })}
        isPending={rejectMutation.isPending}
        value={rejectReason}
        onChange={setRejectReason}
      />

      <DoctorReviewModal
        isOpen={isDoctorReviewModalOpen}
        onClose={() => setIsDoctorReviewModalOpen(false)}
        type={doctorReviewType}
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
  const { state }     = useLocation() || {};
  const isDirectOrder = typeof orderIdProp === "object" && orderIdProp !== null;
  const sqid          = isDirectOrder ? orderIdProp.sqid : (orderIdProp || state?.sqid || state?.order?.id);

  const { data: fetchedOrder, isLoading: orderLoading } = useQuery({
    queryKey: ["lab-order", sqid],
    queryFn:  () => fetchLabOrderDetail(sqid),
    enabled:  !!sqid && !isDirectOrder,
  });

  const rawOrder = isDirectOrder ? orderIdProp : fetchedOrder;
  const order = rawOrder ? normalizeOrder(rawOrder, state?.order?.tab) : (state?.order ?? {});

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

      <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => onBackProp ? onBackProp() : navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#3E4095] transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          Lab Order Details
        </button>
      </div>

      <PatientInfoCard
        order={order}
        isCompleted={order.aggregate_status === "result_ready" || order.aggregate_status === "completed"}
        isRejected={order.aggregate_status === "rejected"}
        isInProgress={order.aggregate_status === "in_progress" || order.aggregate_status === "sample_collected"}
      />

      <div className="mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Test Items</h2>
        {order.items?.map((item) => (
          <LabTestItem 
            key={item.sqid} 
            order={order} 
            item={item} 
            isDoctorView={isDoctorView} 
            queryClient={queryClient} 
          />
        ))}
        {(!order.items || order.items.length === 0) && (
          <p className="text-sm text-gray-500 py-4">No test items found for this order.</p>
        )}
      </div>
    </>
  );
};

export default Hospital_Lab_Test_Detail_Dashboard;
