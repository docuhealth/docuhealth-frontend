import React from "react";
import TaskCreationModal from "./TaskCreationModal";

const IO_PROTOCOL_OPTIONS = [
  "Strict 24-Hour Fluid Balance (Intake + Output)",
  "Intake Only Monitoring",
  "Output Only Monitoring",
  "Loose I&O Monitoring",
];

/**
 * "Input and output" quick-service flow from OtherMedicalServicesFab.
 * There's no backend endpoint for I&O tasks yet, so "Create this task"
 * just confirms locally — swap in a real mutation once the API exists.
 */
const FluidIntakeOutputModal = ({ onClose }) => (
  <TaskCreationModal
    title="Fluid Intake & Output Task"
    primaryLabel="I&O Protocol Type"
    primaryOptions={IO_PROTOCOL_OPTIONS}
    successMessage="Fluid Intake & Output task created!"
    onClose={onClose}
  />
);

export default FluidIntakeOutputModal;
