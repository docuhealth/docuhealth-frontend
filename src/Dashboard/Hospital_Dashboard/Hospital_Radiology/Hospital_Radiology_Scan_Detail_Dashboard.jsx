import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, Pencil, Printer, Download, Eye, ArrowDownToLine, Image as ImageIcon, FileText, X, Info, CalendarDays } from "lucide-react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { formatFullDateTime } from "../../../Components/Dashboard/Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import TimeInput from "../../../Components/ui/TimeInput";
import { printElement, downloadElementAsPdf, slugify } from "../../../utils/exportElement";
import { saveBlob, urlToBlob, withExtension } from "../../../utils/fileActions";
import { acceptScanOrderItem, rejectScanOrderItem, logImagingDateTime } from "../../../queries/Hospital/radiology/scan_requests";
import { extractApiErrorMessage } from "../../../utils/apiError";


// Same layout format as the doctor's patient-record detail view (PatientInfo.jsx's "viewDetailMedicalRecord").
const STATUS_STYLE = {
  pending: { label: "Pending", color: "text-amber-500" },
  in_progress: { label: "In-progress", color: "text-amber-600" },
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
// Looks disabled but stays clickable, so clicking it while imaging time is unset can show the "log it first" notice.
const pillFilledDisabledLook =
  "flex items-center justify-center gap-1 border border-gray-200 text-gray-400 bg-gray-100 rounded-full py-1.5 px-4 w-full sm:w-auto cursor-not-allowed";

const Hospital_Radiology_Scan_Detail_Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { state } = useLocation() || {};
  const order = state?.order;

  const [status, setStatus] = useState(order?.status || "pending");
  const [imagingAt, setImagingAt] = useState(order?.imaging_at || null);
  const [rejectionReason, setRejectionReason] = useState(order?.rejection_reason || null);
  // Set once, on the fresh mount that follows the upload-result page handing
  // control back with a finished order — never mutated in place.
  const report = order?.report || null;
  const attachments = order?.attachments || [];

  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showImagingRequiredModal, setShowImagingRequiredModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  // Set right before an "accept now" mutation fires, so its onSuccess knows
  // to chain straight into the imaging-time modal (accept and log-imaging
  // are two separate API calls; "accept later" only fires the first one).
  const [openEditAfterAccept, setOpenEditAfterAccept] = useState(false);

  const invalidateScanRequests = () => queryClient.invalidateQueries({ queryKey: ["radiology-scan-requests"] });

  const acceptMutation = useMutation({
    mutationFn: acceptScanOrderItem,
    onSuccess: (updated) => {
      setStatus(updated.status);
      setImagingAt(updated.imaging_at);
      invalidateScanRequests();
      toast.success("Scan request accepted — moved to In-progress");
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

  const imagingTimeMutation = useMutation({
    mutationFn: logImagingDateTime,
    onSuccess: (updated) => {
      setImagingAt(updated.imaging_at);
      setShowEditModal(false);
      invalidateScanRequests();
      toast.success("Imaging time and date updated");
    },
    onError: (err) => toast.error(extractApiErrorMessage(err, "Failed to update imaging time.")),
  });
  // The region Print out / Download output: everything under the header row.
  const printRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  // Index of the attachment row whose file is being opened/saved, to stop double clicks.
  const [busyFile, setBusyFile] = useState(null);
  // The file open in the preview modal: { name, url (object URL), type }.
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!preview) return;
    const closeOnEscape = (e) => {
      if (e.key === "Escape") setPreview(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

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
            onClick={() => navigate("/hospital-radiology-requests-dashboard")}
            className="flex items-center gap-1 text-docuhealth-primary font-medium"
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

  // Supabase serves every uploaded result file with `content-type:
  // text/plain` regardless of what it actually is (confirmed live
  // 2026-09-22), so the fetched blob's own `.type` can't be trusted —
  // re-wrap it with the type the API told us at upload time instead.
  const getAttachmentBlob = async (file) => {
    const blob = await urlToBlob(file.url);
    return file.contentType && file.contentType !== blob.type ? new Blob([blob], { type: file.contentType }) : blob;
  };

  const runFileAction = async (index, action, failureMessage) => {
    if (busyFile !== null) return;
    setBusyFile(index);
    try {
      await action();
    } catch (error) {
      console.error("Attachment action failed", error);
      toast.error(failureMessage);
    } finally {
      setBusyFile(null);
    }
  };

  const handleViewFile = (file, index) =>
    runFileAction(
      index,
      async () => {
        const blob = await getAttachmentBlob(file);
        setPreview({ name: withExtension(file.name, blob.type), url: URL.createObjectURL(blob), type: blob.type });
      },
      "Could not open this file"
    );

  const handleDownloadFile = (file, index) =>
    runFileAction(
      index,
      async () => {
        const blob = await getAttachmentBlob(file);
        saveBlob(blob, withExtension(file.name, blob.type));
      },
      "Could not download this file"
    );

  const exportLabel = status === "completed" ? "Imaging result" : "Rejected scan order";
  const handlePrint = () => {
    printElement(printRef.current, `${exportLabel} - ${patientName}`).catch(() => toast.error("Could not open the print dialog"));
  };
  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    const toastId = toast.loading("Preparing PDF...");
    try {
      await downloadElementAsPdf(printRef.current, `${slugify(exportLabel)}-${slugify(patientName)}.pdf`);
      toast.success("PDF downloaded", { id: toastId });
    } catch (error) {
      console.error("PDF export failed", error);
      toast.error("Could not generate the PDF", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  // "Accept request" opens a confirmation modal first (matching the design)
  // rather than accepting immediately — the radiologist chooses whether to
  // log the imaging time/date right away or leave it for later. Accepting
  // and logging imaging time are two separate API calls either way; "now"
  // just chains straight into the edit modal once accept succeeds.
  const handleAcceptNow = () => {
    setShowAcceptModal(false);
    setOpenEditAfterAccept(true);
    acceptMutation.mutate({ sqid: order.sqid });
  };

  const handleAcceptLater = () => {
    setShowAcceptModal(false);
    acceptMutation.mutate({ sqid: order.sqid });
  };

  const handleReject = () => {
    if (!rejectNote.trim()) return;
    rejectMutation.mutate({ sqid: order.sqid, rejection_note: rejectNote.trim() });
  };

  const openEditModal = () => {
    const base = imagingAt ? new Date(imagingAt) : new Date();
    setEditDate(`${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}`);
    setEditTime(base.toTimeString().slice(0, 5));
    setShowEditModal(true);
  };

  const handleSaveImagingTime = () => {
    if (!editDate || !editTime) return;
    imagingTimeMutation.mutate({ sqid: order.sqid, imaging_date: editDate, imaging_time: `${editTime}:00` });
  };

  // Imaging time/date must be logged before a result can be uploaded — if
  // it's still unset (the radiologist picked "Later" at Accept time and
  // never came back to it), block the upload and prompt for it instead.
  // Otherwise hand off to the dedicated "Upload scan result" page, passing
  // the current (possibly locally-edited) order forward so it can merge the
  // finished report/attachments back in when it returns here.
  const handleUploadClick = () => {
    if (!imagingAt) {
      setShowImagingRequiredModal(true);
      return;
    }
    navigate("/hospital-radiology-upload-result", {
      state: { order: { ...order, status, imaging_at: imagingAt } },
    });
  };

  const backLabel = isDecided ? "Imaging result" : "Scan Order Details";

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      <div className="bg-white rounded-xl border mt-3 p-5 text-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 gap-4 sm:gap-0">
          <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1 cursor-pointer">
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
                <button type="button" onClick={openEditModal} className={pillOutline + " flex-1 sm:flex-none"}>
                  {imagingAt ? "Edit Imaging time and date" : "Add Imaging time and date"}
                </button>
                <button
                  type="button"
                  onClick={handleUploadClick}
                  title={!imagingAt ? "Log the imaging time and date first" : undefined}
                  className={(!imagingAt ? pillFilledDisabledLook : pillFilled) + " flex-1 sm:flex-none"}
                >
                  Upload imaging result
                </button>
              </div>
            )}

            {isDecided && (
              <div className="flex gap-3 w-full sm:w-auto">
                <button type="button" onClick={handlePrint} className={pillOutline + " flex-1 sm:flex-none"}>
                  <Printer size={14} />
                  Print out
                </button>
                <button type="button" onClick={handleDownload} disabled={downloading} className={pillFilled + " flex-1 sm:flex-none disabled:opacity-60"}>
                  <Download size={14} />
                  Download
                </button>
              </div>
            )}
          </div>
        </div>

        <div ref={printRef} className="text-sm">
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
                  <p className="text-xs text-gray-400">Imaging Time &amp; Date:</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-docuhealth-dark">{formatFullDateTime(imagingAt) || "N/A"}</p>
                    {status === "in_progress" && (
                      <button
                        type="button"
                        onClick={openEditModal}
                        title={imagingAt ? "Edit imaging time and date" : "Add imaging time and date"}
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

          {/* Imaging order (pending / in_progress) */}
          {!isDecided && (
            <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl">
              <p className="text-[12px] mb-1">Imaging order</p>
              <p className="font-semibold text-docuhealth-primary mb-4">{order.modality || order.scan_type}</p>
              {order.body_part && (
                <>
                  <p className="text-[12px] mb-1">Body part</p>
                  <p className="font-semibold text-docuhealth-primary mb-4">{order.body_part}</p>
                </>
              )}
              <p className="text-[12px] mb-1">Note :</p>
              <p className="text-gray-700 leading-relaxed">{order.note || "—"}</p>
            </div>
          )}

          {/* Rejected */}
          {status === "rejected" && (
            <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl">
              <p className="text-[12px] font-medium text-red-500 mb-1">Reason for rejection (note):</p>
              <p className="text-gray-700 leading-relaxed">{rejectionReason || "No reason provided."}</p>
            </div>
          )}

          {/* Completed report */}
          {status === "completed" && report && (
            <>
              <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl space-y-4">
                <div>
                  <p className="text-[12px] mb-1 text-gray-500">Examinations:</p>
                  <p className="font-medium text-docuhealth-dark">{report.examination}</p>
                </div>
                {report.clinicalIndication.length > 0 && (
                  <div>
                    <p className="text-[12px] mb-1 text-gray-500">Clinical Indication:</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      {report.clinicalIndication.map((line, i) => (
                        <li key={i} className="font-medium text-docuhealth-dark">
                          {line}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                <div>
                  <p className="text-[12px] mb-1 text-gray-500">Technique:</p>
                  <p className="font-medium text-docuhealth-dark">{report.technique}</p>
                </div>
                <div>
                  <p className="text-[12px] mb-1 text-gray-500">Findings:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    {report.findings.map((line, i) => (
                      <li key={i} className="font-medium text-docuhealth-dark">
                        {line}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className="text-[12px] mb-1 text-gray-500">Impression:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    {report.impression.map((line, i) => (
                      <li key={i} className="font-medium text-docuhealth-dark">
                        {line}
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className="text-[12px] mb-1 text-gray-500">Recommendations:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    {report.recommendations.map((line, i) => (
                      <li key={i} className="font-medium text-docuhealth-dark">
                        {line}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div>
                    <p className="text-[12px] mb-1 text-gray-500">Name of Reporter:</p>
                    <p className="font-medium text-docuhealth-dark">{report.reporter}</p>
                  </div>
                  <div>
                    <p className="text-[12px] mb-1 text-gray-500">Specialty:</p>
                    <p className="font-medium text-docuhealth-dark">{report.specialty || "Radiologist"}</p>
                  </div>
                  <div>
                    <p className="text-[12px] mb-1 text-gray-500">Date &amp; Time of report:</p>
                    <p className="font-medium text-docuhealth-dark">{formatFullDateTime(report.reported_at) || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents / Images — same attachment-row styling as the
                  doctor's medical-record detail view. */}
              <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl">
                <p className="font-medium mb-4">Uploaded Documents / Images</p>
                <div>
                  {attachments.length > 0 ? (
                    attachments.map((file, i) => {
                      const Icon = file.kind === "image" ? ImageIcon : FileText;
                      return (
                        <div key={i} data-pdf-unit className="bg-white border rounded-lg px-4 py-3 mb-3">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-5 sm:gap-0 sm:items-center">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-[12px]">
                              <div className="p-2 bg-docuhealth-primary/10 rounded-md">
                                <Icon className="text-docuhealth-primary" size={20} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{file.name}</p>
                                <p className="text-gray-500">
                                  {formatDate(file.date)}
                                  {file.size ? ` • ${file.size}` : ""}
                                </p>
                              </div>
                            </div>

                            <div data-print-hide className="flex flex-col sm:flex-row gap-3 text-[12px] w-full sm:w-auto">
                              <button
                                type="button"
                                onClick={() => handleViewFile(file, i)}
                                disabled={busyFile !== null}
                                className="flex items-center justify-center gap-1 border border-docuhealth-primary text-docuhealth-primary rounded-full font-medium hover:bg-blue-50 transition py-1 px-3 w-full sm:w-28 disabled:opacity-60"
                              >
                                <Eye className="w-3 h-3" />
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadFile(file, i)}
                                disabled={busyFile !== null}
                                className="flex items-center justify-center gap-1 bg-docuhealth-primary text-white rounded-full font-medium hover:bg-docuhealth-dark-primary transition py-1 px-3 w-full sm:w-28 disabled:opacity-60"
                              >
                                <ArrowDownToLine className="w-3 h-3" />
                                Download
                              </button>
                            </div>
                          </div>
                          {/* Printout / PDF only. On screen the image opens from View. */}
                          {file.kind === "image" && file.url && (
                            <img
                              data-print-only
                              src={file.url}
                              alt={file.name}
                              className="hidden w-full max-h-[420px] object-contain rounded-md bg-gray-100 mt-3"
                            />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[12px] text-gray-500">NIL</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col items-center gap-4 relative">
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
              note that time &amp; date of imaging can be logged in now or later!
            </p>

            <button
              type="button"
              onClick={handleAcceptNow}
              disabled={acceptMutation.isPending}
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3 rounded-full hover:bg-docuhealth-dark-primary transition-colors disabled:opacity-60"
            >
              Accept &amp; Log imaging time &amp; date now
            </button>
            <button
              type="button"
              onClick={handleAcceptLater}
              disabled={acceptMutation.isPending}
              className="w-full border border-docuhealth-primary text-docuhealth-primary text-sm font-semibold py-3 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-60"
            >
              Accept &amp; Log imaging time &amp; date Later
            </button>
          </div>
        </div>
      )}

      {showImagingRequiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col items-center gap-4 relative">
            <button
              type="button"
              onClick={() => setShowImagingRequiredModal(false)}
              className="absolute right-4 top-4 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="w-11 h-11 rounded-full border-2 border-gray-800 flex items-center justify-center text-gray-800">
              <Info size={20} />
            </div>

            <h3 className="text-base font-semibold text-gray-900 text-center">Notice!</h3>

            <p className="text-sm text-gray-600 leading-relaxed border border-gray-200 rounded-xl px-4 py-3 w-full">
              You have not logged in the date and time of imaging, kindly update it to enable you upload the
              result/report when it is ready.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowImagingRequiredModal(false);
                openEditModal();
              }}
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3 rounded-full hover:bg-docuhealth-dark-primary transition-colors"
            >
              Log date &amp; time of imaging now
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
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="absolute right-5 top-5 text-docuhealth-dark hover:text-gray-600"
            >
              <X size={22} />
            </button>

            <div className="text-center pt-2">
              <h3 className="text-lg font-semibold text-docuhealth-dark">Imaging Info</h3>
              <p className="text-sm text-gray-500 mt-1">Kindly fill up to proceed!</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={modalLabel}>Patient Name</label>
              <input type="text" value={patientName} readOnly tabIndex={-1} className={readOnlyField} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={modalLabel}>Scan Requested</label>
              <input
                type="text"
                value={`${order.modality || order.scan_type}${order.body_part ? ` (${order.body_part})` : ""}`}
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
              onClick={handleSaveImagingTime}
              disabled={!editDate || !editTime || imagingTimeMutation.isPending}
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3.5 rounded-full disabled:opacity-50"
            >
              Submit entry!
            </button>
          </div>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={() => setPreview(null)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-base font-semibold text-docuhealth-dark break-all">{preview.name}</h3>
              <button
                type="button"
                onClick={() => setPreview(null)}
                aria-label="Close preview"
                className="text-docuhealth-dark hover:text-gray-600 shrink-0"
              >
                <X size={22} />
              </button>
            </div>

            {preview.type.startsWith("image/") ? (
              <div className="bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                <img src={preview.url} alt={preview.name} className="max-h-[70vh] w-auto max-w-full object-contain" />
              </div>
            ) : preview.type === "application/pdf" ? (
              <iframe src={preview.url} title={preview.name} className="w-full h-[70vh] rounded-xl border" />
            ) : (
              <p className="text-sm text-gray-500 py-8 text-center">
                Preview isn&apos;t available for this file type. Use Download to open it.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Hospital_Radiology_Scan_Detail_Dashboard;
