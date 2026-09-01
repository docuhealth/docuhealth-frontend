import React, { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const FIELDS = [
  { key: "problem", label: "Problems/Diagnosis" },
  { key: "goals", label: "Goals/Objective" },
  { key: "intervention", label: "Intervention" },
  { key: "evaluation", label: "Evaluation" },
];

const EMPTY_FORM = FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});

const AddCarePlanForm = ({ onBack, onUpload, isSubmitting }) => {
  const [form, setForm] = useState(EMPTY_FORM);

  const updateField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleUpload = () => {
    const cleanForm = FIELDS.reduce((acc, field) => {
      acc[field.key] = form[field.key] || "";
      return acc;
    }, {});

    const isFormFilled = Object.values(cleanForm).some((v) => v.trim());
    if (!isFormFilled) {
      toast.error("Please fill in at least one field before uploading.");
      return;
    }
    onUpload(cleanForm);
  };

  return (
    <div className="w-full bg-white flex flex-col py-3 mt-5 border rounded-xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 mb-4">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          title="Back"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-sm font-medium text-gray-800">Nursing care plan</h1>
      </div>

      <div className="px-4 md:px-10">
        <div className="mx-auto space-y-6">
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
              disabled={isSubmitting}
              className="px-8 py-3 bg-docuhealth-primary text-white text-sm font-medium rounded-full transition-colors flex items-center justify-center min-w-[200px]"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Upload care plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCarePlanForm;
