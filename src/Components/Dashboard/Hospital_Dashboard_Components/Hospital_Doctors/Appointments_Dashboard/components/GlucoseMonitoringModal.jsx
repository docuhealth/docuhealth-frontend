import React from "react";
import TaskCreationModal from "./TaskCreationModal";

const MONITORING_PROTOCOL_OPTIONS = [
  "4-Point Random Blood Sugar (RBS): Before Meals + Bedtime",
  "Fasting Blood Sugar (FBS) Only",
  "Pre- and Post-Prandial Monitoring",
  "6-Point Glucose Profile",
  "Sliding Scale Insulin Monitoring",
  "Hourly Glucose Monitoring (Critical Care)",
  "Continuous Glucose Monitoring (CGM) Review",
];

/**
 * "Glucose monitoring" quick-service flow from OtherMedicalServicesFab.
 * There's no backend endpoint for glucose monitoring tasks yet, so
 * "Create this task" just confirms locally — swap in a real mutation
 * once the API exists.
 */
const GlucoseMonitoringModal = ({ onClose }) => (
  <TaskCreationModal
    title="Blood Glucose Monitoring Task"
    primaryLabel="Monitoring Schedule / Protocol"
    primaryOptions={MONITORING_PROTOCOL_OPTIONS}
    frequencyLabel="Frequency / Timing"
    successMessage="Blood Glucose Monitoring task created!"
    onClose={onClose}
  />
);

export default GlucoseMonitoringModal;
