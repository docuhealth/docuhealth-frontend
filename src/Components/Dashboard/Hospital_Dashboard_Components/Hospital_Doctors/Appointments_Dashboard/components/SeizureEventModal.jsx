import React from "react";
import TaskCreationModal from "./TaskCreationModal";

const SEIZURE_PROTOCOL_OPTIONS = [
  "Standard Seizure Precautions (Q1H Neuro Checks)",
  "Post-Ictal Monitoring (Q15min x 1hr, then Q1H)",
  "High-Risk Seizure Watch (Q30min Neuro Checks)",
  "Continuous EEG Monitoring",
  "Padded Bed Rails / Fall Precautions Only",
];

/**
 * "Seizure events" quick-service flow from OtherMedicalServicesFab.
 * There's no backend endpoint for seizure monitoring tasks yet, so
 * "Create this task" just confirms locally — swap in a real mutation
 * once the API exists.
 */
const SeizureEventModal = ({ onClose }) => (
  <TaskCreationModal
    title="Seizure Event Monitoring Task"
    primaryLabel="Seizure Monitoring Protocol"
    primaryOptions={SEIZURE_PROTOCOL_OPTIONS}
    frequencyLabel="Frequency / Timing"
    successMessage="Seizure event monitoring task created!"
    onClose={onClose}
  />
);

export default SeizureEventModal;
