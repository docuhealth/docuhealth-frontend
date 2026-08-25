import React, { useRef, useState } from "react";
import { Search, Plus } from "lucide-react";
import TaskCreationModal, { FIELD_BOX_CLASS } from "./TaskCreationModal";
import Input from "../../../../../ui/Input";
import Select from "../../../../../ui/Select";

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
  const updateRowValue = (field) => (value) => onChange({ ...row, [field]: value });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
      <Input
        label="Drug name"
        leadingIcon={<Search className="w-4 h-4" />}
        placeholder="enter medication"
        value={row.drugName}
        onChange={updateRowField("drugName")}
      />

      <Select
        label="Duration"
        value={row.duration}
        onChange={updateRowValue("duration")}
        options={DRUG_DURATION_OPTIONS.map((option) => ({ value: option, label: option }))}
      />

      <Input
        label="Dosage"
        placeholder="Enter dosage..."
        value={row.dosage}
        onChange={updateRowField("dosage")}
      />

      <Select
        label="Route"
        value={row.route}
        onChange={updateRowValue("route")}
        options={ROUTE_OPTIONS.map((option) => ({ value: option, label: option }))}
      />

      <Select
        label="Frequency"
        value={row.frequency}
        onChange={updateRowValue("frequency")}
        options={DRUG_FREQUENCY_OPTIONS.map((option) => ({ value: option, label: option }))}
      />
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
