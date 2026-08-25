import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const FIELDS = [
  { key: "general_condition", label: "General patient condition" },
  { key: "significant_events", label: "Significant events" },
  { key: "medications_due", label: "Medications due" },
  { key: "outstanding_tasks", label: "Outstanding Nursing tasks" },
  { key: "pending_investigations", label: "Pending investigations" },
  { key: "escalations", label: "Escalations" },
  { key: "recommendations", label: "Recommendations" },
];

const EMPTY_FORM = FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});

const AddHandoverNoteForm = ({ onBack, onUpload, handoverNurseName }) => {
  const [form, setForm] = useState(EMPTY_FORM);

  const updateField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleUpload = () => {
    // Make sure at least one field is filled out
    const isFormFilled = Object.values(form).some((v) => v.trim());
    if (!isFormFilled) {
      toast.error("Please fill in at least one field before uploading.");
      return;
    }
    onUpload(form);
    setForm(EMPTY_FORM);
  };

  return (
    <div className="w-full h-full bg-white flex flex-col py-3 mt-5 border rounded-xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 mb-4">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          title="Back"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-sm text-gray-800">Add handover note</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-10 ">
        <div className=" mx-auto space-y-6">
          {FIELDS.map((field) => (
            <div key={field.key} className="border border-slate-200 rounded-xl p-4 ">
              <label className="block text-[13px] font-semibold text-gray-800 mb-3">
                {field.label}
              </label>
              <textarea
                value={form[field.key]}
                onChange={updateField(field.key)}
                placeholder="Click to add notes..."
                className="w-full min-h-[100px] outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent resize-y border rounded-md p-3"
              />
            </div>
          ))}

          <div className="flex justify-end pt-6 pb-12">
            <button
              onClick={handleUpload}
              className="px-8 py-3 bg-docuhealth-primary text-white text-sm font-medium rounded-full transition-colors"
            >
              Upload case note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddHandoverNoteForm;
