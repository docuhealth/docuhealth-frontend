import React from "react";
import TaskCreationModal from "./TaskCreationModal";

const PROCEDURE_OPTIONS = [
  "Lumbar Puncture Assistance",
  "Wound Dressing / Debridement",
  "Urinary Catheter Insertion",
  "Nasogastric Tube Insertion",
  "Chest Tube Insertion",
  "Central Line Insertion",
  "Suturing / Wound Closure",
  "Paracentesis",
  "Incision and Drainage",
  "Cast Application / Removal",
];

/**
 * "Procedure" quick-service flow from OtherMedicalServicesFab. There's no
 * backend endpoint for ward procedure tasks yet, so "Create this task"
 * just confirms locally — swap in a real mutation once the API exists.
 */
const WardProcedureModal = ({ onClose }) => (
  <TaskCreationModal
    title="Ward Procedure Task"
    primaryLabel="Procedure Name"
    primaryOptions={PROCEDURE_OPTIONS}
    frequencyLabel="Frequency / Timing"
    successMessage="Ward procedure task created!"
    onClose={onClose}
  />
);

export default WardProcedureModal;
