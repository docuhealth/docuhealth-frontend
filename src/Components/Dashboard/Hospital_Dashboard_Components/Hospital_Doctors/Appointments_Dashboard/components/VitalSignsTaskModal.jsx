import React from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import TaskCreationModal, { FIELD_BOX_CLASS } from "./TaskCreationModal";
import { createInpatientTask } from "../../../../../../queries/Hospital/doctor/inpatientTasks";

/**
 * "Vitals monitoring task" quick-service flow from OtherMedicalServicesFab.
 * Creates a `vital_signs` care task on the patient's admission via
 * POST /api/inpatients/admissions/<sqid>/tasks — this is a general task
 * for whichever nurse picks it up, not assigned to one nurse the way the
 * older "Vitals" flow (RequestVitalsModal) is.
 *
 * Omitting `config.parameters` asks for the full standard set of vital
 * signs, which is all this form offers today — swap in a parameter picker
 * once the backend documents the allowed `parameters` values (not
 * currently in Swagger).
 */
const VitalSignsTaskModal = ({ admissionSqid, onClose }) => {
  const { mutateAsync } = useMutation({
    mutationFn: (payload) => createInpatientTask({ admissionSqid, payload }),
    onError: (err) => {
      console.error("Error creating vital signs task:", err);
      toast.error(err.response?.data?.message || "Failed to create vital signs task.");
    },
  });

  const handleSubmit = (fields) => {
    // Omit the shared shell's "primary" field — vital_signs has no
    // primary select, only topSection.
    // eslint-disable-next-line no-unused-vars
    const { primary, ...shared } = fields;
    return mutateAsync({
      task_type: "vital_signs",
      config: {},
      ...shared,
    });
  };

  return (
    <TaskCreationModal
      title="Vital Signs Monitoring Task"
      topSection={
        <div className={FIELD_BOX_CLASS}>
          <p className="text-sm text-gray-600">
            This asks whichever nurse is on duty to record the full standard set
            of vital signs (temperature, blood pressure, pulse, respiration rate,
            SpO₂) at each scheduled time below — it is not assigned to a specific
            nurse.
          </p>
        </div>
      }
      frequencyLabel="Monitoring frequency"
      successMessage="Vital signs monitoring task created!"
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
};

export default VitalSignsTaskModal;
