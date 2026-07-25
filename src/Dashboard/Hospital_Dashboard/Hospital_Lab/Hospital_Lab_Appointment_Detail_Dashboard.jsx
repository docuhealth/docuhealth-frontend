import { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { ArrowLeft, Printer, Download, X, ChevronDown } from "lucide-react";
import PatientInfoCard from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/PatientInfoCard";
import RejectModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/RejectModal";
import { LabRequestsContext } from "../../../context/HospitalContext/Lab/LabRequestsContext";
import { useQuery } from "@tanstack/react-query";
import { fetchLabTests } from "../../../queries/Hospital/lab/requests";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  pending:     { label: "Pending",     color: "text-amber-500" },
  in_progress: { label: "In Progress", color: "text-amber-500" },
  completed:   { label: "Completed",   color: "text-green-600" },
  rejected:    { label: "Rejected",    color: "text-red-500"   },
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
    <path d="M11.6654 12.834H10.4987V11.6673C10.4987 10.7008 9.71522 9.91732 8.7487 9.91732H5.2487C4.2822 9.91732 3.4987 10.7008 3.4987 11.6673V12.834H2.33203V11.6673C2.33203 10.0565 3.63787 8.75065 5.2487 8.75065H8.7487C10.3595 8.75065 11.6654 10.0565 11.6654 11.6673V12.834ZM6.9987 7.58398C5.0657 7.58398 3.4987 6.01698 3.4987 4.08398C3.4987 2.15099 5.0657 0.583984 6.9987 0.583984C8.93169 0.583984 10.4987 2.15099 10.4987 4.08398C10.4987 6.01698 8.93169 7.58398 6.9987 7.58398ZM6.9987 6.41732C8.28734 6.41732 9.33203 5.37265 9.33203 4.08398C9.33203 2.79532 8.28734 1.75065 6.9987 1.75065C5.71003 1.75065 4.66536 2.79532 4.66536 4.08398C4.66536 5.37265 5.71003 6.41732 6.9987 6.41732Z" fill="var(--color-docuhealth-secondary)" />
  </svg>
);

const Hospital_Lab_Appointment_Detail_Dashboard = () => {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const { categories } = useContext(LabRequestsContext);

  const raw = state?.appt;
  const order = raw
    ? {
        ...raw,
        datetime: raw.scheduledAt || raw.datetime || "—",
        status: raw.status === "upcoming" ? "pending" : (raw.status || "pending"),
      }
    : {
        name:     "Amara Osei",
        hin:      "HIN-001234",
        test:     "Complete Blood Count (CBC)",
        hospital: "Central General Hospital",
        datetime: "2026-06-12T09:00:00",
        status:   "pending",
      };

  const [showRejectModal,  setShowRejectModal]  = useState(false);
  const [showAcceptModal,  setShowAcceptModal]  = useState(false);
  const [showSampleModal,  setShowSampleModal]  = useState(false);
  const [sampleLogged,     setSampleLogged]     = useState(!!order.specimen_collected_at);
  const [rejectReason,     setRejectReason]     = useState("");
  const [accepting,        setAccepting]        = useState(false);
  const [rejecting,        setRejecting]        = useState(false);

  // Sample / test-order modal state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTestType, setSelectedTestType] = useState("");
  const [requestDate,      setRequestDate]      = useState("");
  const [requestTime,      setRequestTime]      = useState("");

  const { data: testTypesData, isLoading: isTestTypesLoading } = useQuery({
    queryKey: ["lab-tests", selectedCategory],
    queryFn: fetchLabTests,
    enabled: !!selectedCategory,
    staleTime: Infinity,
  });

  const testTypes = Array.isArray(testTypesData) 
    ? testTypesData 
    : (testTypesData?.results ?? []);

  const statusStyle  = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending;
  const isPending    = order.status === "pending";
  const isInProgress = order.status === "in_progress";
  const isCompleted  = order.status === "completed";
  const isRejected   = order.status === "rejected";

  const specimens         = order.test_info?.specimens ?? [];
  const preferredSpecimen = specimens.find((s) => s.is_preferred) ?? specimens[0];
  const specimenLabel     = preferredSpecimen
    ? `${preferredSpecimen.name}${preferredSpecimen.container ? ` (${preferredSpecimen.container})` : ""}`
    : "—";

  const resultParams = order.result_info?.parameters ?? [];
  const headerLabel  = isCompleted || isRejected ? "Lab result" : "Appointment";

  const acceptMutation = {
    mutate: () => {
      setAccepting(true);
      setTimeout(() => {
        setAccepting(false);
        toast.success("Appointment accepted — moved to In-progress");
        navigate(-1);
      }, 800);
    },
    isPending: accepting,
  };

  const rejectMutation = {
    mutate: () => {
      setRejecting(true);
      setTimeout(() => {
        setRejecting(false);
        toast.success("Appointment rejected");
        setShowRejectModal(false);
        navigate(-1);
      }, 800);
    },
    isPending: rejecting,
  };

  const handleCreateTestOrder = () => {
    setAccepting(true);
    setTimeout(() => {
      setAccepting(false);
      setSampleLogged(true);
      setShowSampleModal(false);
      toast.success("Test order created successfully");
      navigate(-1);
    }, 800);
  };

  const canCreateOrder =
    selectedCategory && selectedTestType && requestDate && requestTime;

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      {/* ── Top bar ── */}
      <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-docuhealth-primary transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          {headerLabel}
        </button>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <p className="text-xs sm:text-sm font-medium text-gray-700">
            Status:{" "}
            <span className={`font-semibold ${statusStyle.color}`}>{statusStyle.label}</span>
          </p>

          {/* Pending */}
          {isPending && (
            <>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={acceptMutation.isPending}
                className="border border-red-400 text-red-500 text-xs font-medium px-4 sm:px-5 py-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Reject request
              </button>
              <button
                onClick={() => setShowAcceptModal(true)}
                disabled={acceptMutation.isPending}
                className="border border-docuhealth-primary text-docuhealth-primary text-xs font-medium px-4 sm:px-5 py-2 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {acceptMutation.isPending ? (
                  <><div className="w-3 h-3 border-2 border-docuhealth-primary border-t-transparent rounded-full animate-spin" /> Accepting...</>
                ) : "Accept request"}
              </button>
            </>
          )}

          {/* In-progress */}
          {isInProgress && (
            <>
              <button
                onClick={() => setShowSampleModal(true)}
                className="border border-docuhealth-primary text-docuhealth-primary text-xs font-medium px-4 sm:px-5 py-2.5 rounded-full hover:bg-indigo-50 transition-colors"
              >
                {sampleLogged ? "Edit test order" : "Log sample collection"}
              </button>
              <button
                onClick={() => navigate("/hospital-lab-upload-result", { state: { order } })}
                disabled={!sampleLogged}
                className="bg-docuhealth-primary text-white text-xs font-medium px-4 sm:px-5 py-2.5 rounded-full hover:bg-docuhealth-dark-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Upload test result
              </button>
            </>
          )}

          {/* Completed / Rejected */}
          {(isCompleted || isRejected) && (
            <>
              {/* <button className="flex items-center gap-2 border border-gray-300 text-gray-600 text-xs font-medium px-3 sm:px-4 py-2 rounded-full hover:bg-gray-50 transition-colors">
                <Printer size={13} /> Print out
              </button>
              <button className="flex items-center gap-2 border border-gray-300 text-gray-600 text-xs font-medium px-3 sm:px-4 py-2 rounded-full hover:bg-gray-50 transition-colors">
                <Download size={13} /> Download
              </button> */}
            </>
          )}
        </div>
      </div>

      {/* ── Patient info card ── */}
      <PatientInfoCard
        order={order}
        isCompleted={isCompleted}
        isRejected={isRejected}
        isInProgress={isInProgress}
        onEditSample={() => setShowSampleModal(true)}
        dateLabel={isCompleted || isRejected ? "Date/Time uploaded:" : "Appointment date/time:"}
        hideRequestedBy={!order.requestedBy}
      />

      {/* ── PENDING: test details ── */}
      {isPending && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5 flex flex-col gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Test requested:</p>
            <p className="text-sm font-semibold text-teal-600">{order.test}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Specimen needed:</p>
            <p className="text-sm font-semibold text-docuhealth-primary">{specimenLabel}</p>
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

      {/* ── IN-PROGRESS: test details ── */}
      {isInProgress && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5 flex flex-col gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Test requested:</p>
            <p className="text-sm font-semibold text-teal-600">{order.test}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Specimen needed:</p>
            <p className="text-sm font-semibold text-docuhealth-primary">{specimenLabel}</p>
          </div>
          {order.note && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Note:</p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{order.note}</p>
            </div>
          )}
        </div>
      )}

      {/* ── COMPLETED: result tables + interpretation ── */}
      {isCompleted && (
        <>
          {resultParams.length > 0 && (
            <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5">
              <p className="text-xs sm:text-sm font-semibold text-docuhealth-dark mb-4">{order.test}</p>
              <div className="overflow-x-auto">
                <div className="min-w-[600px] flex flex-col mt-2">
                  <div className="grid grid-cols-6 text-left text-sm bg-gray-100 py-5 rounded-md">
                    <div className="col-span-2 pl-5">Parameter</div>
                    <p>Result</p>
                    <p>Unit</p>
                    <p>Reference range</p>
                    <p>Status</p>
                  </div>
                  {resultParams.map((p, i) => {
                    const info        = p.parameter_info;
                    const paramStatus = getParamStatus(p.value, info);
                    return (
                      <div key={i} className="grid grid-cols-6 items-center text-[12px] text-gray-700 border-b border-b-gray-200">
                        <div className="font-semibold col-span-2 py-6 pl-5 flex items-center gap-1.5 text-gray-600">
                          <ParamIcon />
                          <p>{info.name}</p>
                        </div>
                        <p>{p.value ?? "—"}</p>
                        <p>{info.unit || "—"}</p>
                        <p>{getRefRange(info)}</p>
                        <p className={`capitalize font-medium ${
                          paramStatus === "Normal"    ? "text-green-600"
                          : paramStatus === "Abnormal" ? "text-red-500"
                          : "text-gray-500"
                        }`}>
                          {paramStatus ?? "—"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5 flex flex-col gap-5">
            {order.result_info?.interpretation && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Interpretation:</p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {order.result_info.interpretation}
                </p>
              </div>
            )}
            {order.result_info?.clinical_correlation && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Clinical correlation:</p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {order.result_info.clinical_correlation}
                </p>
              </div>
            )}
            {order.result_info?.comments && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Comments:</p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{order.result_info.comments}</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── REJECTED: reason card ── */}
      {isRejected && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5">
          <p className="text-xs sm:text-sm font-semibold text-red-500 mb-2">Reason for rejection (note):</p>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{order.rejection_reason || "No reason provided."}</p>
        </div>
      )}

      {/* ── Accept confirmation modal ── */}
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
              onClick={() => { setShowAcceptModal(false); setShowSampleModal(true); }}
              className="w-full bg-docuhealth-primary text-white text-sm font-medium py-3 rounded-full border border-transparent transition-colors"
            >
              Accept &amp; Log sample collection now
            </button>
            <button
              onClick={() => { setShowAcceptModal(false); acceptMutation.mutate(); }}
              disabled={acceptMutation.isPending}
              className="w-full border border-docuhealth-primary text-docuhealth-primary text-sm font-medium py-3 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50"
            >
              Accept &amp; Log sample collection Later
            </button>
          </div>
        </div>
      )}

      {/* ── Patient's Lab test Request modal ── */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white border rounded-lg shadow-xl w-full max-w-md p-6 flex flex-col gap-5">

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 text-center pr-6">
                <h3 className="text-base font-bold text-docuhealth-dark">Patient's Lab test Request</h3>
                <p className="text-sm text-gray-500 mt-1">Kindly fill up to proceed!</p>
              </div>
              <button
                onClick={() => setShowSampleModal(false)}
                className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setSelectedTestType(""); }}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-white outline-none appearance-none focus:border-docuhealth-primary transition-colors cursor-pointer"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.sqid} value={cat.sqid}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Test type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Test type</label>
              <div className="relative">
                <select
                  value={selectedTestType}
                  onChange={(e) => setSelectedTestType(e.target.value)}
                  disabled={!selectedCategory}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-white outline-none appearance-none focus:border-docuhealth-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{isTestTypesLoading ? "Loading tests..." : "Select test type"}</option>
                  {testTypes.map((t) => (
                    <option key={t.sqid} value={t.sqid}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Request date + time */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-medium text-gray-700">Request date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={requestDate}
                    onChange={(e) => setRequestDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-white outline-none focus:border-docuhealth-primary transition-colors"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-medium text-gray-700">Request Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={requestTime}
                    onChange={(e) => setRequestTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-white outline-none focus:border-docuhealth-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Create test order button */}
            <button
              onClick={handleCreateTestOrder}
              disabled={!canCreateOrder || accepting}
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {accepting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : "Create test order"}
            </button>
          </div>
        </div>
      )}

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={() => rejectMutation.mutate()}
        isPending={rejectMutation.isPending}
        value={rejectReason}
        onChange={setRejectReason}
      />
    </>
  );
};

export default Hospital_Lab_Appointment_Detail_Dashboard;
