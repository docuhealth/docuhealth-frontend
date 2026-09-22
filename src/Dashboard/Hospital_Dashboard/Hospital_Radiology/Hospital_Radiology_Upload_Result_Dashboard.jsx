import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, X, Paperclip, FileText as FileTextIcon, Info, Check } from "lucide-react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { uploadScanResult } from "../../../queries/Hospital/radiology/scan_requests";
import { extractApiErrorMessage } from "../../../utils/apiError";
import Input from "../../../Components/ui/Input";

// Same "+ Add Entry" pattern as SoapNoteEntry's NoteSection — only one section's input is open at a time.
const NoteListSection = ({
  title,
  field,
  placeholder,
  items,
  draft,
  onDraftChange,
  onAdd,
  onRemove,
  activeSection,
  setActiveSection,
  required = false,
}) => (
  <div className="p-5 bg-white border border-gray-200 rounded-xl">
    <p className="font-medium text-gray-900 mb-2">
      {title}
      {required && <span className="text-red-500"> *</span>}
    </p>

    {items.length > 0 && (
      <div className="space-y-2 mb-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-[12px] flex justify-between items-center gap-2"
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => onRemove(field, idx)}
              className="text-red-500 font-bold shrink-0 cursor-pointer"
            >
              <X size={11} />
            </button>
          </div>
        ))}
      </div>
    )}

    {activeSection === field ? (
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <Input
          autoFocus
          value={draft}
          onChange={(e) => onDraftChange(field, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd(field);
            }
          }}
          placeholder={placeholder}
          containerClassName="flex-1"
          className="text-sm"
        />
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onAdd(field)}
            className="bg-docuhealth-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium"
          >
            Add
          </button>
          <button type="button" onClick={() => setActiveSection(null)} className="text-gray-500 text-sm">
            Cancel
          </button>
        </div>
      </div>
    ) : (
      <button
        type="button"
        onClick={() => setActiveSection(field)}
        className="flex items-center gap-1 text-docuhealth-primary font-medium text-sm"
      >
        <span className="text-lg leading-none">+</span> Add Entry
      </button>
    )}
  </div>
);

const Hospital_Radiology_Upload_Result_Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { state } = useLocation() || {};
  const order = state?.order;
  const fileInputRef = useRef(null);

  const [clinicalIndication, setClinicalIndication] = useState([]);
  const [findings, setFindings] = useState([]);
  const [impression, setImpression] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [files, setFiles] = useState([]); // { file, previewUrl }
  const [extraComment, setExtraComment] = useState("");

  // Only one note section has its input open at a time, same as SoapNoteEntry.
  const [activeSection, setActiveSection] = useState(null);
  const [drafts, setDrafts] = useState({
    clinicalIndication: "",
    findings: "",
    impression: "",
    recommendations: "",
  });

  // Proceed -> Report information -> Confirm Upload -> Success, three
  // sequential modals rather than a single click.
  const [showReportInfoModal, setShowReportInfoModal] = useState(false);
  const [showConfirmUploadModal, setShowConfirmUploadModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [examinations, setExaminations] = useState("");
  const [technique, setTechnique] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [reportTime, setReportTime] = useState("");
  const finalOrderRef = useRef(null);

  const uploadMutation = useMutation({
    mutationFn: uploadScanResult,
    onSuccess: (result) => {
      finalOrderRef.current = { ...order, status: "completed", report: result.report, attachments: result.attachments };
      setShowConfirmUploadModal(false);
      setShowSuccessModal(true);
      queryClient.invalidateQueries({ queryKey: ["radiology-scan-requests"] });
    },
    onError: (err) => {
      setShowConfirmUploadModal(false);
      toast.error(extractApiErrorMessage(err, "Failed to upload scan result."));
    },
  });

  // Revoke object URLs on unmount so we don't leak memory across visits.
  useEffect(() => {
    return () => files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const SECTION_SETTERS = {
    clinicalIndication: setClinicalIndication,
    findings: setFindings,
    impression: setImpression,
    recommendations: setRecommendations,
  };

  const handleDraftChange = (field, value) => setDrafts((prev) => ({ ...prev, [field]: value }));

  const handleAddItem = (field) => {
    const value = drafts[field].trim();
    if (!value) return;
    SECTION_SETTERS[field]((prev) => [...prev, value]);
    setDrafts((prev) => ({ ...prev, [field]: "" }));
    setActiveSection(null);
  };

  const handleRemoveItem = (field, index) => {
    SECTION_SETTERS[field]((prev) => prev.filter((_, i) => i !== index));
  };

  const addFiles = (fileList) => {
    const next = Array.from(fileList).map((file) => ({
      file,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setFiles((prev) => [...prev, ...next]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFiles((prev) => {
      const target = prev[index];
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  // The backend documents findings/impression/recommendation as required on
  // POST /api/radiology/results but doesn't actually enforce it (confirmed
  // live 2026-09-22 — omitting them returns 201 with `[]`), so this page has
  // to hold that line itself instead of relying on a 400 to catch it.
  const cleanList = (list) => list.map((n) => n.trim()).filter(Boolean);
  const hasRequiredNotes = findings.length > 0 && impression.length > 0 && recommendations.length > 0;

  const handleProceedClick = () => {
    if (!hasRequiredNotes) {
      toast.error("Findings, Impression and Recommendation each need at least one entry.");
      return;
    }
    const now = new Date();
    setExaminations(order.scan_type || "");
    setReportDate(now.toISOString().slice(0, 10));
    setReportTime(now.toTimeString().slice(0, 5));
    setShowReportInfoModal(true);
  };

  const handleReportInfoProceed = () => {
    if (!examinations.trim() || !technique.trim() || !reporterName.trim() || !specialty.trim() || !reportDate || !reportTime) return;
    setShowReportInfoModal(false);
    setShowConfirmUploadModal(true);
  };

  const handleConfirmUpload = () => {
    uploadMutation.mutate({
      order_item: order.sqid,
      clinical_indication: cleanList(clinicalIndication),
      findings: cleanList(findings),
      impression: cleanList(impression),
      recommendation: cleanList(recommendations),
      examinations: examinations.trim(),
      technique: technique.trim(),
      reporter_name: reporterName.trim(),
      reporter_specialty: specialty.trim(),
      time_of_reporting: `${reportTime}:00`,
      date_of_reporting: reportDate,
      extra_comment: extraComment.trim() || undefined,
      files: files.map((f) => f.file),
    });
  };

  const handleSuccessDone = () => {
    navigate("/hospital-radiology-scan-detail", {
      state: { order: finalOrderRef.current },
      replace: true,
    });
    toast.success("Imaging result uploaded");
  };

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      <div className="bg-white rounded-xl border mt-3 p-5 text-sm">
        <div className="border-b pb-3 mb-5">
          <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1 cursor-pointer">
            <ArrowLeft size={14} />
            <span>Upload scan result</span>
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <NoteListSection
            title="Clinical indication"
            field="clinicalIndication"
            placeholder="e.g. Evaluation of persistent chest pain for 2 weeks"
            items={clinicalIndication}
            draft={drafts.clinicalIndication}
            onDraftChange={handleDraftChange}
            onAdd={handleAddItem}
            onRemove={handleRemoveItem}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
          <NoteListSection
            title="Findings"
            field="findings"
            placeholder="e.g. No acute abnormality identified"
            items={findings}
            draft={drafts.findings}
            onDraftChange={handleDraftChange}
            onAdd={handleAddItem}
            onRemove={handleRemoveItem}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            required
          />
          <NoteListSection
            title="Impression"
            field="impression"
            placeholder="e.g. Unremarkable radiographic study"
            items={impression}
            draft={drafts.impression}
            onDraftChange={handleDraftChange}
            onAdd={handleAddItem}
            onRemove={handleRemoveItem}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            required
          />
          <NoteListSection
            title="Recommendation"
            field="recommendations"
            placeholder="e.g. Clinical correlation advised"
            items={recommendations}
            draft={drafts.recommendations}
            onDraftChange={handleDraftChange}
            onAdd={handleAddItem}
            onRemove={handleRemoveItem}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            required
          />

          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <p className="font-medium text-gray-900 mb-3">
              Attachment <span className="text-gray-400 font-normal">(optional)</span>
            </p>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-200 rounded-xl py-12 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-docuhealth-primary transition-colors"
            >
              <Paperclip size={22} className="text-gray-700" />
              <p className="text-sm text-gray-500">Drag and drop files here or click to upload</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.length && addFiles(e.target.files)}
            />

            {files.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {files.map((f, i) => (
                  <div key={i} className="relative">
                    {f.previewUrl ? (
                      <img src={f.previewUrl} alt={f.file.name} className="h-16 w-16 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <div className="h-16 w-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <FileTextIcon size={20} className="text-gray-400" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      title={f.file.name}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white border border-red-200 text-red-500 flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <p className="font-medium text-gray-900 mb-3">
              Extra comment <span className="text-gray-400 font-normal">(optional)</span>
            </p>
            <textarea
              rows={3}
              value={extraComment}
              onChange={(e) => setExtraComment(e.target.value)}
              placeholder="Enter any other optional comment"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-docuhealth-primary resize-none transition-colors"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleProceedClick}
              className="bg-docuhealth-primary text-white text-sm font-medium px-10 py-2.5 rounded-full hover:bg-docuhealth-dark-primary transition-colors"
            >
              Proceed
            </button>
          </div>
        </div>
      </div>

      {showReportInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5 relative text-sm">
            <button
              type="button"
              onClick={() => setShowReportInfoModal(false)}
              className="absolute right-5 top-5 text-gray-800 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="text-center pr-6">
              <h3 className="text-base font-semibold text-gray-900">Report information</h3>
              <p className="text-sm text-gray-500 mt-1">Kindly fill up to proceed!</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-900">Examinations</label>
              <Input
                type="text"
                value={examinations}
                onChange={(e) => setExaminations(e.target.value)}
                placeholder="e.g. CT Abdomen"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-900">Technique</label>
              <Input
                type="text"
                value={technique}
                onChange={(e) => setTechnique(e.target.value)}
                placeholder="e.g. Multisection helical CT"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-900">Name of Reporter</label>
              <Input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Enter name of reporter"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-900">Specialty</label>
              <Input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Enter specialty"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-medium text-gray-900">Date of reporting</label>
                <Input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-medium text-gray-900">Time of reporting</label>
                <Input type="time" value={reportTime} onChange={(e) => setReportTime(e.target.value)} />
              </div>
            </div>

            <button
              type="button"
              onClick={handleReportInfoProceed}
              disabled={!examinations.trim() || !technique.trim() || !reporterName.trim() || !specialty.trim() || !reportDate || !reportTime}
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3 rounded-full disabled:opacity-50 transition-colors"
            >
              Proceed
            </button>
          </div>
        </div>
      )}

      {showConfirmUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col items-center gap-4 relative">
            <button
              type="button"
              onClick={() => setShowConfirmUploadModal(false)}
              className="absolute right-4 top-4 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="w-11 h-11 rounded-full border-2 border-gray-800 flex items-center justify-center text-gray-800">
              <Info size={20} />
            </div>

            <h3 className="text-base font-semibold text-gray-900 text-center">Confirm Upload</h3>

            <p className="text-sm text-gray-600 leading-relaxed border border-gray-200 rounded-xl px-4 py-3 w-full">
              By proceeding you confirm that you have carried out the requested scan and you are certain of the
              reports. Once uploaded, result will be shared to both doctor and patient!
            </p>

            <button
              type="button"
              onClick={handleConfirmUpload}
              disabled={uploadMutation.isPending}
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3 rounded-full hover:bg-docuhealth-dark-primary transition-colors disabled:opacity-60"
            >
              {uploadMutation.isPending ? "Uploading..." : "Confirm upload"}
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center">
                <Check size={28} className="text-white" strokeWidth={3} />
              </div>
            </div>

            <p className="text-base font-semibold text-gray-800 text-center leading-snug">
              You have successfully uploaded a
              <br />
              completed scan result!
            </p>

            <button
              type="button"
              onClick={handleSuccessDone}
              className="w-full bg-docuhealth-green text-white text-sm font-semibold py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Hospital_Radiology_Upload_Result_Dashboard;
