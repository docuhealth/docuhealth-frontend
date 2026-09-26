import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, ArrowDownToLine, Image as ImageIcon, FileText, X } from "lucide-react";
import { formatFullDateTime } from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { saveBlob, urlToBlob, withExtension } from "../../../../../utils/fileActions";

const RESULT_STATUS = {
  approved: { label: "Approved", cls: "bg-green-100 text-green-600" },
  pending: { label: "Awaiting doctor approval", cls: "bg-amber-100 text-amber-600" },
  rejected: { label: "Rejected by doctor", cls: "bg-red-100 text-red-500" },
};

const formatDate = (raw) => {
  if (!raw) return null;
  return new Date(raw).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
};

const NumberedList = ({ title, lines }) => (
  <div>
    <p className="text-[12px] mb-1 text-gray-500">{title}</p>
    <ol className="list-decimal pl-5 space-y-1">
      {lines.map((line, i) => (
        <li key={i} className="font-medium text-docuhealth-dark">
          {line}
        </li>
      ))}
    </ol>
  </div>
);

// Report card plus the uploaded files with view/download, shared by the radiologist's scan detail and the doctor's approval screen.
const ScanResultReport = ({ report, attachments = [] }) => {
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

  if (!report) return null;

  const resultStatus = RESULT_STATUS[report.status];

  // Files uploaded before the storage fix are served as text/plain, so re-wrap the blob with the type the API recorded at upload time.
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

  return (
    <>
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl space-y-4">
        {resultStatus && (
          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-gray-500">Result status:</span>
            <span className={`${resultStatus.cls} px-2 py-0.5 rounded-full font-medium`}>{resultStatus.label}</span>
          </div>
        )}
        {report.clinicalIndication.length > 0 && <NumberedList title="Clinical Indication:" lines={report.clinicalIndication} />}
        <NumberedList title="Findings:" lines={report.findings} />
        <NumberedList title="Impression:" lines={report.impression} />
        <NumberedList title="Recommendations:" lines={report.recommendations} />
        {report.extraComment && (
          <div>
            <p className="text-[12px] mb-1 text-gray-500">Extra comment:</p>
            <p className="font-medium text-docuhealth-dark">{report.extraComment}</p>
          </div>
        )}

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

      {/* Same attachment-row styling as the doctor's medical-record detail view. */}
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
                        <p className="text-gray-500">{formatDate(file.date)}</p>
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

      {preview && (
        <div data-print-hide className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={() => setPreview(null)}>
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

export default ScanResultReport;
