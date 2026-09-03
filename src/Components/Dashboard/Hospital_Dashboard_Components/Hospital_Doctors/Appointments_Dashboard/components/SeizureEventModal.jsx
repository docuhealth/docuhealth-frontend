import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import TaskCreationModal, { FIELD_BOX_CLASS, FIELD_LABEL_CLASS } from "./TaskCreationModal";
import { createInpatientTask } from "../../../../../../queries/Hospital/doctor/inpatientTasks";
import Select from "../../../../../ui/Select";

// Backend enums for a `seizure_event` care task's `config`.
const CHARACTERISTICS_OPTIONS = [
  { value: "tonic", label: "Tonic (stiffening)" },
  { value: "clonic", label: "Clonic (jerking)" },
  { value: "tonic_clonic", label: "Tonic-Clonic" },
  { value: "atonic", label: "Atonic (limp)" },
];

const EMERGENCY_STANDING_ORDER_OPTIONS = [
  { value: "none", label: "None" },
  { value: "administer_supplemental_o2", label: "Administer supplemental O₂" },
  { value: "iv_diazepam", label: "IV Diazepam" },
  { value: "iv_midazolam", label: "IV Midazolam" },
  { value: "pr_diazepam_suppository", label: "PR Diazepam suppository" },
  { value: "iv_magnesium_sulfate_4g", label: "IV Magnesium Sulfate 4g" },
];

const SeizureTopSection = ({
  characteristics,
  setCharacteristics,
  standingOrder,
  setStandingOrder,
}) => (
  <>
    <p className="text-sm text-gray-600">
      Set the expected seizure type and the emergency standing order. The nurse
      records the observed details (duration, physical signs, consciousness, …)
      when a seizure actually happens.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div className={FIELD_BOX_CLASS}>
        <label className={FIELD_LABEL_CLASS}>Seizure type (motor movement)<span className="text-red-500"> *</span></label>
        <Select
          value={characteristics}
          onChange={setCharacteristics}
          options={CHARACTERISTICS_OPTIONS}
          placeholder="Select seizure type"
        />
      </div>
      <div className={FIELD_BOX_CLASS}>
        <label className={FIELD_LABEL_CLASS}>Emergency standing order<span className="text-red-500"> *</span></label>
        <Select
          value={standingOrder}
          onChange={setStandingOrder}
          options={EMERGENCY_STANDING_ORDER_OPTIONS}
          placeholder="Select standing order"
        />
      </div>
    </div>
  </>
);

/**
 * "Seizure events" quick-service flow from OtherMedicalServicesFab. Creates a
 * `seizure_event` care task on the patient's admission via
 * POST /api/inpatients/admissions/<sqid>/tasks. The doctor sets the seizure
 * type + emergency standing order (`config`); the nurse fills the observed
 * details on execution. Defaults to `prn` frequency, running until discharge.
 */
const SeizureEventModal = ({ admissionSqid, onClose }) => {
  const [characteristics, setCharacteristics] = useState("tonic_clonic");
  const [standingOrder, setStandingOrder] = useState("none");

  const isTopSectionValid = !!characteristics && !!standingOrder;

  const { mutateAsync } = useMutation({
    mutationFn: (payload) => createInpatientTask({ admissionSqid, payload }),
    onError: (err) => {
      console.error("Error creating seizure event task:", err);
      toast.error(err.response?.data?.message || "Failed to create seizure event task.");
    },
  });

  const handleSubmit = (fields) => {
    // seizure_event has no shared "primary" select — only the custom topSection.
    // eslint-disable-next-line no-unused-vars
    const { primary, ...shared } = fields;
    return mutateAsync({
      task_type: "seizure_event",
      config: {
        characteristics,
        emergency_standing_order: standingOrder,
      },
      ...shared,
    });
  };

  return (
    <TaskCreationModal
      title="Seizure Event Monitoring Task"
      topSection={
        <SeizureTopSection
          characteristics={characteristics}
          setCharacteristics={setCharacteristics}
          standingOrder={standingOrder}
          setStandingOrder={setStandingOrder}
        />
      }
      isTopSectionValid={isTopSectionValid}
      frequencyLabel="Frequency / Timing"
      defaultFrequency="prn"
      defaultRepeatUntil="discharge"
      successMessage="Seizure event monitoring task created!"
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
};

export default SeizureEventModal;
