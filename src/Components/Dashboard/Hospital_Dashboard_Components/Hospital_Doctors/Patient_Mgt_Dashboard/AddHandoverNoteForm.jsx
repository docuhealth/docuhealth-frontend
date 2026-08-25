import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const FIELDS = [
  { key: "working_diagnosis", label: "Working diagnosis", required: true },
  { key: "current_clinical_status", label: "Current Clinical Status", required: true },
  { key: "critical_events", label: "Critical Events" },
  { key: "outstanding_investigations", label: "Outstanding Investigations" },
  { key: "pending_procedures", label: "Pending Procedures" },
  { key: "pending_consult_reviews", label: "Pending Consult Reviews" },
  { key: "clinical_concerns", label: "Clinical Concerns" },
  { key: "management_plan", label: "Management Plan for Next Team" },
];

const EMPTY_FORM = FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});

// There's no backend endpoint yet for listing/creating per-patient handover
// notes (only a nurse end-of-shift summary exists, which is a different
// thing), so this just hands the filled-in note back to the parent — see
// PatientHandoverTab.jsx. The receiving doctor was already picked in the
// step before this one (SelectHandoverDoctorModal).
//
// Same "inline page, not a modal" shell as AddProgressNoteForm in
// TabDetails2.jsx (Progress Note tab).
const AddHandoverNoteForm = ({ onBack, onUpload, handoverDoctorName }) => {
  const [form, setForm] = useState(EMPTY_FORM);

  const isFormFilled = FIELDS.filter((f) => f.required).every((f) => form[f.key].trim());

  const updateField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleUpload = () => {
    if (!isFormFilled) {
      toast.error("Please fill in the Working diagnosis and Current Clinical Status.");
      return;
    }
    onUpload(form);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="bg-white rounded-lg border mt-3 px-3 lg:px-5 py-5 text-sm">
      <div className="flex items-center gap-1 cursor-pointer border-b pb-3">
        <div onClick={onBack}>
          <ArrowLeft className="w-4 h-4 text-gray-800" />
        </div>
        <p>Add handover note</p>
      </div>

      <div className="my-5">
        {handoverDoctorName && (
          <div className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 bg-docuhealth-light-gray">
            <p className="font-medium text-[12px] text-gray-500">Handing over to</p>
            <p className="font-medium text-docuhealth-dark">{handoverDoctorName}</p>
          </div>
        )}

        {FIELDS.map((field) => (
          <div key={field.key} className="border rounded-md px-3 lg:px-5 py-4 lg:py-5 mt-3">
            <p className="font-medium">{field.label}</p>
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
              isFormFilled ? "bg-docuhealth-primary cursor-pointer" : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!isFormFilled}
            onClick={handleUpload}
          >
            Upload handover note
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddHandoverNoteForm;
