import React from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import TaskCreationModal from "./TaskCreationModal";
import { createInpatientTask } from "../../../../../../queries/Hospital/doctor/inpatientTasks";

// `procedure_name` is free text on the backend, not an enum — this list is
// just a starting point for the doctor, not a constraint.
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
].map((name) => ({ value: name, label: name }));

/**
 * "Procedure" quick-service flow from OtherMedicalServicesFab. Creates a
 * `procedure` care task on the patient's admission via
 * POST /api/inpatients/admissions/<sqid>/tasks.
 */
const WardProcedureModal = ({ admissionSqid, onClose }) => {
  const { mutateAsync } = useMutation({
    mutationFn: (payload) => createInpatientTask({ admissionSqid, payload }),
    onError: (err) => {
      console.error("Error creating procedure task:", err);
      toast.error(err.response?.data?.message || "Failed to create procedure task.");
    },
  });

  const handleSubmit = ({ primary, ...shared }) =>
    mutateAsync({
      task_type: "procedure",
      config: { procedure_name: primary },
      ...shared,
    });

  return (
    <TaskCreationModal
      title="Ward Procedure Task"
      primaryLabel="Procedure Name"
      primaryOptions={PROCEDURE_OPTIONS}
      frequencyLabel="Frequency / Timing"
      successMessage="Ward procedure task created!"
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
};

export default WardProcedureModal;
