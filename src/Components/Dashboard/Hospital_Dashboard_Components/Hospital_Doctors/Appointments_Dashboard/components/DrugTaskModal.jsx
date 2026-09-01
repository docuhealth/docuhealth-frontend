import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import TaskCreationModal from "./TaskCreationModal";
import MedicationSection from "./MedicationSection";
import { createInpatientTask } from "../../../../../../queries/Hospital/doctor/inpatientTasks";
import { DEFAULT_FREQUENCY } from "../../../../../../utils/careTaskConstants";

// MedicationSection expresses duration as a value + a unit label ("Day" /
// "Week" / "Month"); the medication-task endpoint wants the backend
// RateEnum (`hours` | `days` | `weeks` | `months`) on `dosage.duration.rate`.
const DURATION_RATE_BY_UNIT = {
  Hour: "hours",
  Day: "days",
  Week: "weeks",
  Month: "months",
};

const createEmptyMedication = () => ({
  catalog_drug: null,
  drug: "",
  strength: "",
  doseForm: "",
  dosage: "",
  dosageUnit: "mg",
  route: "Oral",
  frequency: DEFAULT_FREQUENCY,
  duration: "",
  durationUnit: "Day",
});

const isMedicationFilled = (med) =>
  med.drug.trim() !== "" && String(med.dosage).trim() !== "";

// Shape one MedicationSection row into a `config.drugs[]` entry
// (MedicationDrugItem): a catalog reference when the doctor picked a
// catalog drug, otherwise the free-text `manual_drug`. `dosage.duration`
// is nullable here (unlike the pharmacy order), so an unset duration is
// sent as null rather than a zeroed object.
const toDrugPayload = (med) => {
  const drugRef = med.catalog_drug
    ? { catalog_drug: med.catalog_drug }
    : {
        manual_drug: {
          name: med.drug.trim(),
          route: med.route,
          ...(med.strength ? { strength: med.strength } : {}),
          ...(med.doseForm ? { dose_form: med.doseForm } : {}),
        },
      };

  return {
    ...drugRef,
    dosage: {
      quantity: Number(med.dosage) || 0,
      unit: med.dosageUnit,
      frequency: med.frequency,
      duration: med.duration
        ? {
            value: Number(med.duration) || 0,
            rate: DURATION_RATE_BY_UNIT[med.durationUnit] || "days",
          }
        : null,
    },
  };
};

/**
 * "Drug task (nurse)" quick-service flow from OtherMedicalServicesFab.
 * Creates a `medication` care task on the patient's admission via
 * POST /api/inpatients/admissions/<sqid>/tasks — the backend turns this
 * into one nurse MAR task per drug (with its scheduled occurrences) and
 * raises the matching pharmacy order in the same call. Because each drug
 * carries its own frequency/duration, the shared shell's single
 * frequency/duration row is switched off (`showFrequencyDuration={false}`)
 * and the drug chart is plugged in as the `topSection`, reusing the same
 * MedicationSection + careTaskConstants the Prescribe Medication (pharmacy
 * order) form uses so the two drug forms can't drift apart.
 */
const DrugTaskModal = ({ admissionSqid, onClose }) => {
  const [medications, setMedications] = useState(() => [createEmptyMedication()]);

  const { mutateAsync } = useMutation({
    mutationFn: (payload) => createInpatientTask({ admissionSqid, payload }),
    onError: (err) => {
      console.error("Error creating drug task:", err);
      toast.error(err.response?.data?.message || "Failed to create drug task.");
    },
  });

  // eslint-disable-next-line no-unused-vars
  const handleSubmit = ({ primary, ...shared }) => {
    const filledMedications = medications.filter(isMedicationFilled);
    if (filledMedications.length === 0) {
      toast.error("Add at least one medication with a dosage.");
      return Promise.reject(new Error("No medication rows filled in."));
    }

    return mutateAsync({
      ...shared,
      task_type: "medication",
      config: { drugs: filledMedications.map(toDrugPayload) },
    });
  };

  return (
    <TaskCreationModal
      title="Drug Chart / MAR Orders"
      topSection={
        <MedicationSection medications={medications} setMedications={setMedications} />
      }
      isTopSectionValid={medications.some(isMedicationFilled)}
      showFrequencyDuration={false}
      successMessage="Drug chart task created!"
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
};

export default DrugTaskModal;
