import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

// Shared field list for the doctor-to-doctor handover note: the create form
// here, the search filter in PatientHandoverTab.jsx, and the read-only render
// in HandoverNoteDetailPage.jsx all key off this so labels stay in sync with
// POST/GET /api/doctors/handover(s).
export const HANDOVER_FIELDS = [
  { key: "working_diagnosis", label: "Working diagnosis", required: true },
  { key: "current_clinical_status", label: "Current Clinical Status", required: true },
  { key: "critical_events", label: "Critical Events" },
  { key: "outstanding_investigations", label: "Outstanding Investigations" },
  { key: "pending_procedures", label: "Pending Procedures" },
  { key: "pending_consult_reviews", label: "Pending Consult Reviews" },
  { key: "clinical_concerns", label: "Clinical Concerns" },
  { key: "management_plan", label: "Management Plan for Next Team" },
];

const EMPTY_FORM = HANDOVER_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});

// Doctor-to-doctor handover note form. The receiving doctor was picked in the
// step before this (SelectHandoverDoctorModal); on upload the parent
// (PatientHandoverTab) POSTs the filled fields to /api/doctors/handover. Only
// `working_diagnosis` and `current_clinical_status` are required; the other
// six go up as empty strings when left blank.
//
// Same "inline page, not a modal" shell as AddProgressNoteForm in
// TabDetails2.jsx (Progress Note tab).
const AddHandoverNoteForm = ({ onBack, onUpload, handoverDoctorName, isSubmitting = false }) => {
  const [form, setForm] = useState(EMPTY_FORM);

  const isFormFilled = HANDOVER_FIELDS.filter((f) => f.required).every((f) => form[f.key].trim());

  const updateField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleUpload = () => {
    if (isSubmitting) return;
    if (!isFormFilled) {
      toast.error("Please fill in the Working diagnosis and Current Clinical Status.");
      return;
    }
    onUpload(form);
  };

  return (
    <div className="bg-white rounded-lg border mt-3 px-3 lg:px-5 py-5 text-sm">
      <button
        type="button"
        className="flex items-center gap-1 cursor-pointer border-b pb-3 w-full"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4 text-gray-800" />
        <span>Add handover note</span>
      </button>

      <div className="my-5">
        {handoverDoctorName && (
          <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 bg-docuhealth-light-gray">
            <p className="font-medium text-[12px] text-gray-500">Handing over to</p>
            <p className="font-medium text-docuhealth-dark">{handoverDoctorName}</p>
          </div>
        )}

        {HANDOVER_FIELDS.map((field) => (
          <div key={field.key} className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
            <p className="font-medium">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </p>
            <textarea
              value={form[field.key]}
              onChange={updateField(field.key)}
              className="w-full my-2 rounded-sm border focus:outline-none p-3 text-[12px] h-auto max-h-[300px]"
              placeholder="Click to add notes..."
            ></textarea>
          </div>
        ))}

        <div className="flex justify-end cursor-pointer">
          <button
            className={`py-2.5 text-white rounded-full text-sm px-20 mt-5 w-full lg:w-auto ${
              isFormFilled && !isSubmitting
                ? "bg-docuhealth-primary cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!isFormFilled || isSubmitting}
            onClick={handleUpload}
          >
            {isSubmitting ? "Uploading..." : "Upload handover note"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddHandoverNoteForm;
