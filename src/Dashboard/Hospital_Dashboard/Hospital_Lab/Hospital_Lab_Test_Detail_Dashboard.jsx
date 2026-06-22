import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { ArrowLeft, Printer, Download, Calendar, Clock, X } from "lucide-react";
import PatientInfoCard from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/PatientInfoCard";
import RejectModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/RejectModal";
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

/* ─── main component ─── */
const Hospital_Lab_Test_Detail_Dashboard = () => {
  const navigate  = useNavigate();
  const { state } = useLocation();

  const order = state?.order ?? {
    name:     "Amara Okafor",
    hin:      "12456********",
    test:     "Malaria/Typhoid Test",
    hospital: "Lagos General Hospital",
    datetime: "30th, May., 2026/ 9:45 AM",
    status:   "pending",
  };

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [sampleLogged, setSampleLogged] = useState(!!order.specimen_collected_at);
  const [sampleDate, setSampleDate] = useState("");
  const [sampleTime, setSampleTime] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const statusStyle  = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending;
  const isPending    = order.status === "pending";
  const isInProgress = order.status === "in_progress";
  const isCompleted  = order.status === "completed";
  const isRejected   = order.status === "rejected";

  const specimens    = order.test_info?.specimens ?? [];
  const preferredSpecimen = specimens.find((s) => s.is_preferred) ?? specimens[0];
  const specimenLabel = preferredSpecimen
    ? `${preferredSpecimen.name}${preferredSpecimen.container ? ` (${preferredSpecimen.container})` : ""}`
    : "—";

  const resultParams = order.result_info?.parameters ?? [];

  const headerLabel = isCompleted || isRejected ? "Lab result" : "Test";

  const acceptMutation = {
    mutate: () => {
      setAccepting(true);
      setTimeout(() => {
        setAccepting(false);
        toast.success("Request accepted — moved to In-progress");
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
        toast.success("Request rejected");
        setShowRejectModal(false);
        navigate(-1);
      }, 800);
    },
    isPending: rejecting,
  };

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      {/* ── Top bar ── */}
      <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#3E4095] transition-colors w-fit"
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
                className="border border-[#3E4095] text-[#3E4095] text-xs font-medium px-4 sm:px-5 py-2 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {acceptMutation.isPending ? (
                  <><div className="w-3 h-3 border-2 border-[#3E4095] border-t-transparent rounded-full animate-spin" /> Accepting...</>
                ) : "Accept request"}
              </button>
            </>
          )}

          {/* In-progress */}
          {isInProgress && (
            <>
              <button
                onClick={() => setShowSampleModal(true)}
                className="border border-[#3E4095] text-[#3E4095] text-xs font-medium px-4 sm:px-5 py-2.5 rounded-full hover:bg-indigo-50 transition-colors"
              >
                {sampleLogged ? "Edit sample collection info" : "Log sample collection"}
              </button>
              <button
                onClick={() => navigate("/hospital-lab-upload-result", { state: { order } })}
                disabled={!sampleLogged}
                className="bg-[#3E4095] text-white text-xs font-medium px-4 sm:px-5 py-2.5 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Upload test result
              </button>
            </>
          )}

          {/* Completed / Rejected */}
          {(isCompleted || isRejected) && (
            <>
              <button className="flex items-center gap-2 border border-gray-300 text-gray-600 text-xs font-medium px-3 sm:px-4 py-2 rounded-full hover:bg-gray-50 transition-colors">
                <Printer size={13} /> Print out
              </button>
              <button className="flex items-center gap-2 border border-gray-300 text-gray-600 text-xs font-medium px-3 sm:px-4 py-2 rounded-full hover:bg-gray-50 transition-colors">
                <Download size={13} /> Download
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Patient info card (all tabs) ── */}
      <PatientInfoCard
        order={order}
        isCompleted={isCompleted}
        isRejected={isRejected}
        isInProgress={isInProgress}
        onEditSample={() => setShowSampleModal(true)}
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

      {/* ── IN-PROGRESS: test details ── */}
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

      {/* ── COMPLETED: result tables + interpretation ── */}
      {isCompleted && (
        <>
          {resultParams.length > 0 && (
            <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-5">
              <p className="text-xs sm:text-sm font-semibold text-[#1B2B40] mb-4">{order.test}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[420px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500">
                      <th className="pb-3 pr-4 font-medium text-xs sm:text-sm">Parameter</th>
                      <th className="pb-3 pr-4 font-medium text-xs sm:text-sm">Result</th>
                      <th className="pb-3 pr-4 font-medium text-xs sm:text-sm">Unit</th>
                      <th className="pb-3 pr-4 font-medium text-xs sm:text-sm">Reference range</th>
                      <th className="pb-3 font-medium text-xs sm:text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {resultParams.map((p, i) => {
                      const info = p.parameter_info;
                      const paramStatus = getParamStatus(p.value, info);
                      return (
                        <tr key={i}>
                          <td className="py-3 pr-4 text-xs sm:text-sm text-gray-600">{info.name}</td>
                          <td className="py-3 pr-4 text-xs sm:text-sm text-gray-600">{p.value ?? "—"}</td>
                          <td className="py-3 pr-4 text-xs sm:text-sm text-gray-500">{info.unit || "—"}</td>
                          <td className="py-3 pr-4 text-xs sm:text-sm text-gray-500">{getRefRange(info)}</td>
                          <td className={`py-3 text-xs sm:text-sm font-medium ${
                            paramStatus === "Normal" ? "text-green-600"
                            : paramStatus === "Abnormal" ? "text-red-500"
                            : "text-gray-500"
                          }`}>
                            {paramStatus ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Interpretation + Clinical correlation + Comments */}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col items-center gap-4">
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
            <p className="text-sm text-gray-600 text-center leading-relaxed border border-gray-200 rounded-lg px-4 py-3">
              By proceeding you confirm that you are ready and capable of proceeding with the test requested. Kindly note that sample collection can be logged in now or later!
            </p>
            <button
              onClick={() => { setShowAcceptModal(false); setShowSampleModal(true); }}
              className="w-full bg-[#3E4095] text-white text-sm font-medium py-3 rounded-full hover:bg-indigo-700 transition-colors"
            >
              Accept &amp; Log sample collection now
            </button>
            <button
              onClick={() => { setShowAcceptModal(false); acceptMutation.mutate(); }}
              disabled={acceptMutation.isPending}
              className="w-full border border-[#3E4095] text-[#3E4095] text-sm font-medium py-3 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50"
            >
              Accept &amp; Log sample collection Later
            </button>
          </div>
        </div>
      )}

      {/* ── Sample Collection Info modal ── */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
            {/* Header */}
            <div className="relative flex items-start justify-center">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">Edit Sample Collection Info</h3>
                <p className="text-sm text-gray-500 mt-1">Kindly fill up to proceed!</p>
              </div>
              <button
                onClick={() => setShowSampleModal(false)}
                className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Patient Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-500">Patient Name</label>
              <input
                type="text"
                readOnly
                value={order.name ?? ""}
                className="border-b border-gray-300 pb-2 text-sm text-gray-400 bg-transparent outline-none"
              />
            </div>

            {/* Test Requested */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-500">Test Requested</label>
              <input
                type="text"
                readOnly
                value={order.test ?? ""}
                className="border-b border-gray-300 pb-2 text-sm text-gray-400 bg-transparent outline-none"
              />
            </div>

            {/* Date + Time */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm text-gray-500">New sample collection date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={sampleDate}
                    onChange={(e) => setSampleDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white outline-none w-full pr-9 focus:border-[#3E4095] transition-colors"
                  />
                  <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3E4095] pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm text-gray-500">New sample Collection Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={sampleTime}
                    onChange={(e) => setSampleTime(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white outline-none w-full pr-9 focus:border-[#3E4095] transition-colors"
                  />
                  <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3E4095] pointer-events-none" />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSampleModal(false);
                setSampleLogged(true);
                acceptMutation.mutate();
              }}
              disabled={!sampleDate || !sampleTime || acceptMutation.isPending}
              className="w-full bg-[#3E4095] text-white text-sm font-semibold py-3.5 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {acceptMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating...
                </span>
              ) : "Update entry!"}
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

export default Hospital_Lab_Test_Detail_Dashboard;
