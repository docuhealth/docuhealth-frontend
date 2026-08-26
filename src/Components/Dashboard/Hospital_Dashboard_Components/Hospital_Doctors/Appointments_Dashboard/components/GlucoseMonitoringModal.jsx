import React from "react";
import TaskCreationModal from "./TaskCreationModal";

// The backend's `schedule` enum for glucose tasks isn't documented in
// Swagger beyond a single example ("four_point_rbs") — these are display
// labels only until the backend confirms the full valid set, so this modal
// stays unwired (see WardProcedureModal/FluidIntakeOutputModal for the
// wired pattern to follow once it's confirmed).
const MONITORING_PROTOCOL_OPTIONS = [
  "4-Point Random Blood Sugar (RBS): Before Meals + Bedtime",
  "Fasting Blood Sugar (FBS) Only",
  "Pre- and Post-Prandial Monitoring",
  "6-Point Glucose Profile",
  "Sliding Scale Insulin Monitoring",
  "Hourly Glucose Monitoring (Critical Care)",
  "Continuous Glucose Monitoring (CGM) Review",
].map((label) => ({ value: label, label }));

/**
 * "Glucose monitoring" quick-service flow from OtherMedicalServicesFab.
 * The `glucose` task type exists on the backend now, but its `schedule`
 * config value isn't documented, so "Create this task" still just
 * confirms locally — swap in a real mutation once the valid `schedule`
 * values are confirmed.
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
