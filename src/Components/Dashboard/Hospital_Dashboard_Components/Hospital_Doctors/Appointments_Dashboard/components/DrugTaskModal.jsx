import React, { useRef, useState } from "react";
import { Search, ChevronDown, Plus } from "lucide-react";
import TaskCreationModal, { FIELD_BOX_CLASS } from "./TaskCreationModal";

const ROUTE_OPTIONS = ["Oral", "IV", "IM", "SC", "Topical", "Sublingual", "Rectal", "Inhalation"];

const DRUG_DURATION_OPTIONS = [
  "Until discharge",
  "24 hours",
  "48 hours",
  "72 hours",
  "5 days",
  "7 days",
  "Until discontinued",
];

const DRUG_FREQUENCY_OPTIONS = [
  "Q4H (4-Hourly)",
  "Q6H (6-Hourly)",
  "Q8H (8-Hourly)",
  "Q12H (12-Hourly)",
  "OD (Once daily)",
  "BD (Twice daily)",
  "TDS (Three times daily)",
  "PRN (As needed)",
];

const ROW_LABEL_CLASS = "block text-sm font-medium text-gray-700 mb-1";
const ROW_INPUT_CLASS =
  "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-docuhealth-primary placeholder:text-gray-400";
const ROW_SELECT_CLASS = `${ROW_INPUT_CLASS} appearance-none cursor-pointer pr-8`;

const createEmptyDrugRow = (id) => ({
  id,
  drugName: "",
  duration: DRUG_DURATION_OPTIONS[0],
  dosage: "",
  route: ROUTE_OPTIONS[0],
  frequency: DRUG_FREQUENCY_OPTIONS[0],
});

const DrugRow = ({ row, onChange }) => {
  const updateRowField = (field) => (e) => onChange({ ...row, [field]: e.target.value });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
      <div>
        <label className={ROW_LABEL_CLASS}>Drug name</label>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            className={`${ROW_INPUT_CLASS} pl-9`}
            placeholder="enter medication"
            value={row.drugName}
            onChange={updateRowField("drugName")}
          />
        </div>
      </div>

      <div>
        <label className={ROW_LABEL_CLASS}>Duration</label>
        <div className="relative">
          <select className={ROW_SELECT_CLASS} value={row.duration} onChange={updateRowField("duration")}>
            {DRUG_DURATION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className={ROW_LABEL_CLASS}>Dosage</label>
        <input
          type="text"
          className={ROW_INPUT_CLASS}
          placeholder="Enter dosage..."
          value={row.dosage}
          onChange={updateRowField("dosage")}
        />
      </div>

      <div>
        <label className={ROW_LABEL_CLASS}>Route</label>
        <div className="relative">
          <select className={ROW_SELECT_CLASS} value={row.route} onChange={updateRowField("route")}>
            {ROUTE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className={ROW_LABEL_CLASS}>Frequency</label>
        <div className="relative">
          <select className={ROW_SELECT_CLASS} value={row.frequency} onChange={updateRowField("frequency")}>
            {DRUG_FREQUENCY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

const MedicationSection = ({ rows, setRows, nextIdRef }) => {
  const updateRow = (id) => (updatedRow) =>
    setRows((prev) => prev.map((row) => (row.id === id ? updatedRow : row)));

  const addRow = () =>
    setRows((prev) => [...prev, createEmptyDrugRow(`drug-row-${nextIdRef.current++}`)]);

  return (
    <div className={FIELD_BOX_CLASS}>
      <p className="font-semibold text-gray-900 mb-4">Medication</p>
      <div className="space-y-4">
        {rows.map((row) => (
          <DrugRow key={row.id} row={row} onChange={updateRow(row.id)} />
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1 text-docuhealth-primary font-medium text-sm mt-4 cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Add more drugs
      </button>
    </div>
  );
};

/**
 * "Drug task (nurse)" quick-service flow from OtherMedicalServicesFab.
 * Unlike the other quick-service modals this needs a repeatable drug
 * chart instead of a single dropdown, so it plugs its own top section
 * into the shared TaskCreationModal shell rather than using its default
 * primary field. There's no backend endpoint for this yet, so "Create
 * this task" just confirms locally — swap in a real mutation once the
 * API exists.
 */
const DrugTaskModal = ({ onClose }) => {
  const nextIdRef = useRef(2);
  const [rows, setRows] = useState(() => [
    createEmptyDrugRow("drug-row-0"),
    createEmptyDrugRow("drug-row-1"),
  ]);

  const isMedicationValid = rows.some((row) => row.drugName.trim() !== "");

  return (
    <TaskCreationModal
      title="Drug Chart / MAR Orders"
      topSection={<MedicationSection rows={rows} setRows={setRows} nextIdRef={nextIdRef} />}
      isTopSectionValid={isMedicationValid}
      showFrequencyDuration={false}
      successMessage="Drug chart task created!"
      onClose={onClose}
    />
  );
};

export default DrugTaskModal;
