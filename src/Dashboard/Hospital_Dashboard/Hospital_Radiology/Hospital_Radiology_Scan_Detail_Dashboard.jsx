import React, { useRef, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, Pencil, Download, X, Info, CalendarDays, Eye } from "lucide-react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { formatFullDateTime } from "../../../Components/Dashboard/Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import TimeInput from "../../../Components/ui/TimeInput";
import ScanResultReport from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Radiology/Scan_Requests/ScanResultReport";
import RadiologyOfficialReportTemplate from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Radiology/RadiologyOfficialReportTemplate";
import { printElement, downloadElementAsPdf, slugify } from "../../../utils/exportElement";
import { acceptScanOrderItem, rejectScanOrderItem, logImageCollection, logScanResultDownload } from "../../../queries/Hospital/radiology/scan_requests";
import { extractApiErrorMessage } from "../../../utils/apiError";
import HospitalLoader from "../../../Components/ui/HospitalLoader";
import { RadiologyAppContext } from "../../../context/HospitalContext/Radiology/RadiologyAppContext";


// Same layout format as the doctor's patient-record detail view (PatientInfo.jsx's "viewDetailMedicalRecord").
const STATUS_STYLE = {
  pending: { label: "Pending", color: "text-amber-500" },
  in_progress: { label: "In-progress", color: "text-amber-600" },
  image_collected: { label: "Image collected", color: "text-blue-600" },
  completed: { label: "Completed", color: "text-green-600" },
  rejected: { label: "Rejected", color: "text-red-500" },
};

// First 2 and last 2 digits visible, everything between masked.
const maskHIN = (hin) => {
  if (!hin) return "—";
  return hin.length > 4 ? `${hin.slice(0, 2)}${"*".repeat(hin.length - 4)}${hin.slice(-2)}` : hin;
};

const formatDate = (raw) => {
  if (!raw) return null;
  return new Date(raw).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
};

// Imaging Info modal: prefilled fields styled like the editable ones, just not editable.
const modalLabel = "text-sm font-medium text-docuhealth-dark";
const modalField = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-docuhealth-dark";
const readOnlyField = `${modalField} bg-white outline-hidden cursor-not-allowed`;
const editableField = `${modalField} flex items-center justify-between text-left`;

// Native date picker only opens from the small icon; force it open on any click instead.
const openDatePicker = (e) => {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    // Unsupported or picker already open — the native click behavior still applies.
  }
};

// Same pill shape/sizing as "Print summary" / "Download PDF" on the doctor's page.
const pillOutline =
  "flex items-center justify-center gap-1 border border-docuhealth-primary text-docuhealth-primary rounded-full py-1.5 px-4 w-full sm:w-auto";
const pillFilled =
  "flex items-center justify-center gap-1 border border-docuhealth-primary text-white bg-docuhealth-primary rounded-full py-1.5 px-4 w-full sm:w-auto";

const Hospital_Radiology_Scan_Detail_Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    hospitalName = "",
    hospitalLogo = null,
    hospitalAddress = "",
    hospitalEmail = "",
  } = useContext(RadiologyAppContext) || {};
  const { state } = useLocation() || {};
  const order = state?.order;
  const fromStatus =
    state?.fromStatus ||
    sessionStorage.getItem("radiology_active_status") ||
    "pending";

  const handleBack = () => {
    navigate(`/hospital-radiology-requests-dashboard?status=${fromStatus}`, {
      state: { activeStatus: fromStatus },
    });
  };

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [status, setStatus] = useState(order?.status || "pending");
  const [imageCollectedAt, setImageCollectedAt] = useState(order?.image_collected_at || null);
  const [rejectionReason, setRejectionReason] = useState(order?.rejection_reason || null);
  // Set once, on the fresh mount that follows the upload-result page handing
  // control back with a finished order, never mutated in place.
  const report = order?.report || null;
  const attachments = order?.attachments || [];

  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  // Set right before an "accept now" mutation fires, so its onSuccess knows
  // to chain straight into the collection-time modal (accept and log-collection
  // are two separate API calls; "accept later" only fires the first one).
  const [openEditAfterAccept, setOpenEditAfterAccept] = useState(false);

  const invalidateScanRequests = () => queryClient.invalidateQueries({ queryKey: ["radiology-scan-requests"] });

  const acceptMutation = useMutation({
    mutationFn: acceptScanOrderItem,
    onSuccess: (updated) => {
      setStatus(updated.status);
      setImageCollectedAt(updated.image_collected_at);
      // The modal stays open while accepting so its loader shows; close it on success.
      setShowAcceptModal(false);
      invalidateScanRequests();
      toast.success("Scan request accepted and moved to In-progress");
      if (openEditAfterAccept) {
        setOpenEditAfterAccept(false);
        openEditModal();
      }
    },
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to accept scan request.")),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectScanOrderItem,
    onSuccess: (updated) => {
      setStatus(updated.status);
      setRejectionReason(updated.rejection_reason);
      setShowRejectModal(false);
      invalidateScanRequests();
      toast.success("Scan request rejected");
    },
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to reject scan request.")),
  });

  // Logging collection moves the item to image_collected, which is what unlocks the result upload.
  const imageCollectionMutation = useMutation({
    mutationFn: logImageCollection,
    onSuccess: (updated) => {
      setStatus(updated.status);
      setImageCollectedAt(updated.image_collected_at);
      setShowEditModal(false);
      invalidateScanRequests();
      toast.success("Image collection logged. You can now upload the result.");
    },
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to log image collection.")),
  });
  // The region Print out / Download output: everything under the header row.
  const printRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!order) {
    return (
      <>
        <div className="py-2">
          <DynamicDate />
        </div>
        <div className="bg-white rounded-xl border mt-3 p-5 text-sm flex flex-col items-center text-center gap-3 py-10">
          <p className="text-gray-500">No scan request selected.</p>
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 text-docuhealth-primary font-medium cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Scan Orders
          </button>
        </div>
      </>
    );
  }

  const patient = order.patient_info || {};
  const patientName = `${patient.firstname || ""} ${patient.lastname || ""}`.trim() || "Unknown";
  const statusStyle = STATUS_STYLE[status] || STATUS_STYLE.pending;
  const isDecided = status === "completed" || status === "rejected";
  const showImagingRow = status !== "rejected";
  // A pending result is waiting on the ordering doctor; a rejected one lets the radiologist upload a fresh attempt.
  const resultStatus = report?.status;
  const awaitingApproval = status === "image_collected" && resultStatus === "pending";
  const canUpload = status === "image_collected" && !awaitingApproval;
  const showReport = !!report && (status === "completed" || awaitingApproval);

  // Only scan results that are completed or approved can be downloaded or previewed.
  // Pending, in-progress, image-collected, or rejected requests CANNOT be downloaded or previewed!
  const isBlockedRadiologyStatus =
    status === "pending" ||
    status === "in_progress" ||
    status === "image_collected" ||
    status === "rejected";

  const hasRadiologyResultToExport =
    Boolean(report) &&
    !isBlockedRadiologyStatus &&
    (status === "completed" ||
      status === "approved" ||
      resultStatus === "approved" ||
      resultStatus === "completed");

  const exportLabel = status === "rejected" ? "Rejected scan order" : "Imaging result";

  const sanitizeForFilename = (str) =>
    String(str || "")
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const patientNameSlug = sanitizeForFilename(patientName || "Patient");
  const scanNameSlug = sanitizeForFilename(order.scan_type || "Scan_Result");
  const hospitalNameSlug = sanitizeForFilename(order.hospital_info?.name || order.hospital || hospitalName || "Hospital");
  const downloadFileName = `${patientNameSlug}_${scanNameSlug}_${hospitalNameSlug}.pdf`;

  // Audit the export; never blocks or fails it. Print outs use the downloads event too (the only one the backend has)
  const logDownload = () => {
    if (report?.sqid) logScanResultDownload(report.sqid).catch((err) => console.warn("Download audit log failed", err));
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    if (!hasRadiologyResultToExport) {
      toast.error("Radiology result is not ready for printing.");
      return;
    }
    printElement(printRef.current, `${exportLabel} - ${patientName}`).catch(() => toast.error("Could not open the print dialog"));
    logDownload();
  };
  const handleDownload = async () => {
    if (downloading || !printRef.current) return;
    if (!hasRadiologyResultToExport) {
      toast.error("Radiology result is not ready for download.");
      return;
    }

    // Option 1: Audit the download immediately upon user trigger so mobile canvas limitations never omit audit logs
    if (report?.sqid) {
      logScanResultDownload(report.sqid)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["radiology-scan-requests"] });
        })
        .catch((err) => console.warn("Download audit log failed", err));
    }

    setDownloading(true);
    const toastId = toast.loading("Preparing PDF...");
    try {
      await downloadElementAsPdf(printRef.current, downloadFileName, { scale: 1.75 });
      toast.success("PDF downloaded", { id: toastId });
    } catch (error) {
      console.error("PDF export failed", error);
      toast.error("Could not generate the PDF", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  // "Accept request" opens a confirmation modal first (matching the design)
  // rather than accepting immediately: the radiologist chooses whether to
  // log the image collection time right away or leave it for later. Accepting
  // and logging collection are two separate API calls either way; "now"
  // just chains straight into the edit modal once accept succeeds.
  const handleAcceptNow = () => {
    setOpenEditAfterAccept(true);
    acceptMutation.mutate({ sqid: order.sqid });
  };

  const handleAcceptLater = () => {
    acceptMutation.mutate({ sqid: order.sqid });
  };

  const handleReject = () => {
    if (!rejectNote.trim()) return;
    rejectMutation.mutate({ sqid: order.sqid, rejection_reason: rejectNote.trim() });
  };

  const openEditModal = () => {
    const base = new Date();
    setEditDate(`${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}`);
    setEditTime(base.toTimeString().slice(0, 5));
    setShowEditModal(true);
  };

  // The picked local date and time go up as one ISO datetime.
  const handleSaveImageCollection = () => {
    if (!editDate || !editTime) return;
    imageCollectionMutation.mutate({ sqid: order.sqid, image_collected_at: new Date(`${editDate}T${editTime}`).toISOString() });
  };

  // Results can only be uploaded once image collection is logged (status image_collected). Hand off to the
  // dedicated "Upload scan result" page, passing the current order forward so it can merge the finished
  // report/attachments back in when it returns here.
  const handleUploadClick = () => {
    navigate("/hospital-radiology-upload-result", {
      state: { order: { ...order, status, image_collected_at: imageCollectedAt }, fromStatus },
    });
  };

  const backLabel = isDecided ? "Imaging result" : "Scan Order Details";

  return (
    <>
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
          <RadiologyOfficialReportTemplate
            order={order}
            report={report}
            attachments={attachments}
            hospitalName={hospitalName}
            hospitalLogo={hospitalLogo}
            hospitalAddress={hospitalAddress}
            hospitalEmail={hospitalEmail}
          />
        </div>
      </div>

      <div className="py-2">
        <DynamicDate />
      </div>

      <div className="bg-white rounded-xl border mt-3 p-5 text-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 gap-4 sm:gap-0">
          <button type="button" onClick={handleBack} className="flex items-center gap-1 cursor-pointer">
            <ArrowLeft size={14} />
            <span>{backLabel}</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {!isDecided && (
              <p className="w-full sm:w-auto">
                Status: <span className={`font-semibold ${statusStyle.color}`}>{statusStyle.label}</span>
              </p>
            )}

            {status === "pending" && (
              <div className="flex gap-3 w-full sm:w-auto">
                <button type="button" onClick={() => setShowRejectModal(true)} className="flex-1 sm:flex-none border border-red-400 text-red-500 rounded-full py-1.5 px-4">
                  Reject request
                </button>
                <button type="button" onClick={() => setShowAcceptModal(true)} className={pillOutline + " flex-1 sm:flex-none"}>
                  Accept request
                </button>
              </div>
            )}

            {status === "in_progress" && (
              <div className="flex gap-3 w-full sm:w-auto">
                <button type="button" onClick={openEditModal} className={pillFilled + " flex-1 sm:flex-none"}>
                  Log image collection time
                </button>
              </div>
            )}

            {canUpload && (
              <div className="flex gap-3 w-full sm:w-auto">
                <button type="button" onClick={handleUploadClick} className={pillFilled + " flex-1 sm:flex-none"}>
                  {resultStatus === "rejected" ? "Upload new result" : "Upload imaging result"}
                </button>
              </div>
            )}

            {hasRadiologyResultToExport && (
              <div className="flex flex-wrap gap-2.5 sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className={pillOutline + " flex-1 sm:flex-none"}
                >
                  <Eye size={14} />
                  Preview Record
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className={pillFilled + " flex-1 sm:flex-none disabled:opacity-60"}
                >
                  <Download size={14} />
                  {downloading ? "Downloading..." : "Download"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-sm">

          {/* Patient / order info */}
          <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl">
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 ${showImagingRow ? "xl:grid-cols-[1.2fr_1fr_1.4fr_1.3fr_1fr]" : "xl:grid-cols-4"}`}>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-docuhealth-dark">{patientName}</p>
                <p className="text-xs text-gray-500">Patient HIN: {maskHIN(patient.hin)}</p>
                <p className="text-xs text-gray-500">Age: {patient.age ? `${patient.age} years` : "—"}</p>
                <p className="text-xs text-gray-500">
                  Gender: <span className="capitalize">{patient.sex || "—"}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Payment category: <span className="font-medium text-docuhealth-green">{patient.payment_category || "—"}</span>
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Requested by:</p>
                <p className="text-sm font-bold text-docuhealth-dark">{order.requested_by || "—"}</p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Provider information:</p>
                <p className="text-sm font-bold text-docuhealth-dark">{order.hospital_info?.name || "—"}</p>
                <p className="text-xs text-gray-500">Email: {order.hospital_info?.email || "—"}</p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Date/Time of scan request:</p>
                <p className="text-sm font-semibold text-docuhealth-dark">{formatFullDateTime(order.created_at) || "—"}</p>
              </div>

              {showImagingRow && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-400">Image collected at:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-docuhealth-dark">{formatFullDateTime(imageCollectedAt) || "N/A"}</p>
                    {status === "in_progress" && (
                      <button
                        type="button"
                        onClick={openEditModal}
                        title="Log image collection time"
                        className="h-4 w-4 rounded-full border border-docuhealth-primary text-docuhealth-primary flex items-center justify-center hover:bg-indigo-50 transition-colors shrink-0"
                      >
                        <Pencil size={9} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Imaging order, on every status: the result no longer carries an "Examinations" line naming the scan */}
          <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl">
            <p className="text-[12px] mb-1">Imaging order</p>
            <p className="font-semibold text-docuhealth-primary">{order.scan_type}</p>
          </div>

          {/* Doctor's verdict on the last upload */}
          {awaitingApproval && (
            <div className="p-5 my-5 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-[12px] font-medium text-amber-600 mb-1">Awaiting doctor approval</p>
              <p className="text-gray-700 leading-relaxed">
                The uploaded result has been sent to the ordering doctor. It becomes final once they approve it.
              </p>
            </div>
          )}
          {status === "image_collected" && resultStatus === "rejected" && (
            <div className="p-5 my-5 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-[12px] font-medium text-red-500 mb-1">The doctor rejected your last upload:</p>
              <p className="text-gray-700 leading-relaxed">{report.rejection_reason || "No reason provided."}</p>
              <p className="text-[12px] text-gray-500 mt-2">Upload a corrected result to try again.</p>
            </div>
          )}

          {/* Rejected */}
          {status === "rejected" && (
            <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl">
              <p className="text-[12px] font-medium text-red-500 mb-1">Reason for rejection (note):</p>
              <p className="text-gray-700 leading-relaxed">{rejectionReason || "No reason provided."}</p>
            </div>
          )}

          {showReport && <ScanResultReport report={report} attachments={attachments} />}
        </div>
      </div>

      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col items-center gap-4 relative">
            {acceptMutation.isPending && <HospitalLoader variant="overlay" label="Accepting scan request..." />}
            <button
              type="button"
              onClick={() => setShowAcceptModal(false)}
              className="absolute right-4 top-4 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="w-11 h-11 rounded-full border-2 border-gray-800 flex items-center justify-center text-gray-800">
              <Info size={20} />
            </div>

            <h3 className="text-base font-semibold text-gray-900 text-center">Confirm Acceptance</h3>

            <p className="text-sm text-gray-600 leading-relaxed border border-gray-200 rounded-xl px-4 py-3 w-full">
              By proceeding you confirm that you are ready and capable of proceeding with the scan requested. Kindly
              note that the time &amp; date the image was collected can be logged in now or later!
            </p>

            <button
              type="button"
              onClick={handleAcceptNow}
              disabled={acceptMutation.isPending}
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3 rounded-full hover:bg-docuhealth-dark-primary transition-colors disabled:opacity-60"
            >
              Accept &amp; Log image collection time now
            </button>
            <button
              type="button"
              onClick={handleAcceptLater}
              disabled={acceptMutation.isPending}
              className="w-full border border-docuhealth-primary text-docuhealth-primary text-sm font-semibold py-3 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-60"
            >
              Accept &amp; Log image collection time Later
            </button>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5 relative">
            {rejectMutation.isPending && <HospitalLoader variant="overlay" label="Rejecting scan request..." />}
            <button
              type="button"
              onClick={() => setShowRejectModal(false)}
              className="absolute right-5 top-5 text-gray-800 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="text-center pr-6">
              <h3 className="text-base font-semibold text-gray-900">Reject scan request</h3>
              <p className="text-sm text-gray-500 mt-1">Kindly provide a feedback for Decline</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">Add note :</label>
              <textarea
                rows={4}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Enter your reason for rejecting this scan request..."
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-700 outline-none focus:border-red-400 resize-none transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={handleReject}
              disabled={!rejectNote.trim() || rejectMutation.isPending}
              className="w-full bg-red-600 text-white text-sm font-semibold py-3.5 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject request
            </button>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5 relative text-sm">
            {imageCollectionMutation.isPending && <HospitalLoader variant="overlay" label="Logging image collection..." />}
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="absolute right-5 top-5 text-docuhealth-dark hover:text-gray-600"
            >
              <X size={22} />
            </button>

            <div className="text-center pt-2">
              <h3 className="text-lg font-semibold text-docuhealth-dark">Imaging Info</h3>
              <p className="text-sm text-gray-500 mt-1">Kindly fill up to proceed! This cannot be changed once submitted.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={modalLabel}>Patient Name</label>
              <input type="text" value={patientName} readOnly tabIndex={-1} className={readOnlyField} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={modalLabel}>Scan Requested</label>
              <input
                type="text"
                value={order.scan_type}
                readOnly
                tabIndex={-1}
                className={readOnlyField}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className={modalLabel}>Date of Imaging</label>
                <div className="relative">
                  <div className={editableField}>
                    <span className={editDate ? "" : "text-gray-400"}>
                      {editDate ? formatDate(`${editDate}T00:00:00`) : "Select date"}
                    </span>
                    <CalendarDays className="w-4 h-4 shrink-0 text-docuhealth-primary" />
                  </div>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    onClick={openDatePicker}
                    aria-label="Date of imaging"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className={modalLabel}>Time of Imaging</label>
                <TimeInput
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="rounded-xl! border-gray-200! text-docuhealth-dark"
                  iconClassName="text-docuhealth-primary"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveImageCollection}
              disabled={!editDate || !editTime || imageCollectionMutation.isPending}
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3.5 rounded-full disabled:opacity-50"
            >
              Submit entry!
            </button>
          </div>
        </div>
      )}

      {/* Full A4 Scrollable Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-100 rounded-2xl w-full max-w-4xl h-[94vh] flex flex-col overflow-hidden shadow-2xl border border-gray-300">
            {/* Modal header toolbar */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-gray-900">
                  Official Radiology Record Preview
                </h3>
                <span className="text-xs text-gray-500 hidden sm:inline">
                  (Standard A4 Sheet Format)
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
                <RadiologyOfficialReportTemplate
                  order={order}
                  report={report}
                  attachments={attachments}
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

export default Hospital_Radiology_Scan_Detail_Dashboard;
