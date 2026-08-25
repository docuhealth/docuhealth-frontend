import React, { useState } from "react";
import { Check, X, Pencil } from "lucide-react";
import Input from "../../../../ui/Input";

// Renders the medications the patient is currently on (pulled from their
// most recent drug record) so the discharging doctor can Stop, Continue, or
// Modify each one before discharge. All actions are local UI state only —
// there's no backend endpoint yet to persist a per-drug discharge decision.
const statusStyles = {
  continue: "bg-green-50 text-green-600 border-green-200",
  stopped: "bg-red-50 text-red-500 border-red-200 line-through",
  modified: "bg-amber-50 text-amber-600 border-amber-200",
};

const DischargeMedicationsTable = ({ medications, setMedications }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [draft, setDraft] = useState(null);

  if (!medications || medications.length === 0) {
    return (
      <p className="text-[12px] text-gray-500 italic py-3">
        No current medications on file for this admission.
      </p>
    );
  }

  const setStatus = (index, status) => {
    setMedications((prev) =>
      prev.map((med, i) => (i === index ? { ...med, status } : med)),
    );
  };

  const startModify = (index) => {
    setEditingIndex(index);
    setDraft({ ...medications[index] });
  };

  const saveModify = (index) => {
    setMedications((prev) =>
      prev.map((med, i) => (i === index ? { ...draft, status: "modified" } : med)),
    );
    setEditingIndex(null);
    setDraft(null);
  };

  const cancelModify = () => {
    setEditingIndex(null);
    setDraft(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[640px]">
        <thead>
          <tr className="text-[12px] text-gray-500 border-b">
            <th className="pb-2 font-medium">Drug name</th>
            <th className="pb-2 font-medium">Dosage</th>
            <th className="pb-2 font-medium">Route</th>
            <th className="pb-2 font-medium">Frequency</th>
            <th className="pb-2 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="text-[12px]">
          {medications.map((med, index) => {
            const isEditing = editingIndex === index;
            return (
              <tr key={index} className="border-b last:border-0">
                <td className="py-3 font-medium text-docuhealth-dark">
                  {isEditing ? (
                    <Input
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className="text-[12px] py-1.5"
                    />
                  ) : (
                    med.name
                  )}
                </td>
                <td className="py-3 text-gray-600">
                  {isEditing ? (
                    <Input
                      value={draft.dosage}
                      onChange={(e) => setDraft({ ...draft, dosage: e.target.value })}
                      className="text-[12px] py-1.5"
                    />
                  ) : (
                    med.dosage || "—"
                  )}
                </td>
                <td className="py-3 text-gray-600">
                  {isEditing ? (
                    <Input
                      value={draft.route}
                      onChange={(e) => setDraft({ ...draft, route: e.target.value })}
                      className="text-[12px] py-1.5"
                    />
                  ) : (
                    med.route || "Oral"
                  )}
                </td>
                <td className="py-3 text-gray-600">
                  {isEditing ? (
                    <Input
                      value={draft.frequency}
                      onChange={(e) => setDraft({ ...draft, frequency: e.target.value })}
                      className="text-[12px] py-1.5"
                    />
                  ) : (
                    med.frequency || "—"
                  )}
                </td>
                <td className="py-3">
                  {isEditing ? (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => saveModify(index)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-green-300 text-green-600 hover:bg-green-50"
                      >
                        <Check size={12} /> Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelModify}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50"
                      >
                        <X size={12} /> Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => setStatus(index, "stopped")}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-red-300 text-red-500 hover:bg-red-50"
                      >
                        <X size={12} /> Stop
                      </button>
                      <button
                        type="button"
                        onClick={() => startModify(index)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-amber-300 text-amber-600 hover:bg-amber-50"
                      >
                        <Pencil size={12} /> Modify
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(index, "continue")}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-green-300 text-green-600 hover:bg-green-50"
                      >
                        <Check size={12} /> Continue
                      </button>
                      {med.status && statusStyles[med.status] && (
                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${statusStyles[med.status]}`}>
                          {med.status}
                        </span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DischargeMedicationsTable;
