import React from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import TaskCreationModal from "./TaskCreationModal";
import { createInpatientTask } from "../../../../../../queries/Hospital/doctor/inpatientTasks";

// The exact `schedule` values the backend's ScheduleEnum accepts for a
// `glucose` care task (labels mirror the enum's Swagger descriptions).
const GLUCOSE_SCHEDULE_OPTIONS = [
  { value: "four_point_rbs", label: "4-Point RBS" },
  { value: "six_point_rbs", label: "6-Point RBS" },
  { value: "eight_point_rbs", label: "8-Point RBS" },
  { value: "fasting_early_morning", label: "Fasting Blood Sugar - Early Morning" },
  { value: "q1h_rbs", label: "Q1H RBS" },
  { value: "q2h_rbs", label: "Q2H RBS" },
  { value: "q4h_rbs", label: "Q4H RBS" },
  { value: "q6h_rbs", label: "Q6H RBS" },
  { value: "q8h_rbs", label: "Q8H RBS" },
  { value: "post_prandial_2_hours", label: "2 Hours Post-Prandial" },
];

/**
 * "Glucose monitoring" quick-service flow from OtherMedicalServicesFab.
 * Creates a `glucose` care task on the patient's admission via
 * POST /api/inpatients/admissions/<sqid>/tasks — `config.schedule` is the
 * chosen protocol; the shell's `frequency` (required by the backend for this
 * task type too), start time, repeat-until, priority and instructions ride
 * along.
 */
const GlucoseMonitoringModal = ({ admissionSqid, onClose }) => {
  const { mutateAsync } = useMutation({
    mutationFn: (payload) => createInpatientTask({ admissionSqid, payload }),
    onError: (err) => {
      console.error("Error creating glucose monitoring task:", err);
      toast.error(
        err.response?.data?.message || "Failed to create glucose monitoring task.",
      );
    },
  });

  const handleSubmit = ({ primary, ...shared }) =>
    mutateAsync({
      task_type: "glucose",
      config: { schedule: primary },
      ...shared,
    });

  return (
    <TaskCreationModal
      title="Blood Glucose Monitoring Task"
      primaryLabel="Monitoring Schedule / Protocol"
      primaryOptions={GLUCOSE_SCHEDULE_OPTIONS}
      frequencyLabel="Frequency / Timing"
      successMessage="Blood Glucose Monitoring task created!"
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
};

export default GlucoseMonitoringModal;
