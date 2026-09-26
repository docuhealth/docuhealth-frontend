import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import TaskCreationModal from "./TaskCreationModal";
import MedicationSection from "./MedicationSection";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import { createInpatientTask } from "../../../../../../queries/Hospital/doctor/inpatientTasks";
import { DEFAULT_FREQUENCY } from "../../../../../../utils/careTaskConstants";
import { resolveOrderContext } from "../../../../../../utils/careOrderContext";
import { extractApiErrorMessage } from "../../../../../../utils/apiError";

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
 * In inpatient admission context:
 * Creates a `medication` care task on the patient's admission via
 * POST /api/inpatients/admissions/<sqid>/tasks — the backend turns this
 * into one nurse MAR task per drug and raises the matching pharmacy order.
 * In appointment / outpatient context:
 * Sends the medication order via POST /api/pharmacy/orders/create so
 * nurses and pharmacists receive the prescribed task/order.
 */
const DrugTaskModal = ({ admissionSqid, selectedPatientDetails, onClose }) => {
  const queryClient = useQueryClient();
  const [medications, setMedications] = useState(() => [createEmptyMedication()]);

  const orderContext = resolveOrderContext(selectedPatientDetails);

  const effectiveAdmissionSqid =
    admissionSqid ||
    orderContext.admission ||
    selectedPatientDetails?.admission_sqid ||
    selectedPatientDetails?.admission?.sqid ||
    (selectedPatientDetails?.ward_info || selectedPatientDetails?.bed_info
      ? selectedPatientDetails?.sqid
      : null);

  const { mutateAsync } = useMutation({
    mutationFn: async ({ shared, filledMedications }) => {
      if (effectiveAdmissionSqid) {
        const payload = {
          ...shared,
          task_type: "medication",
          config: { drugs: filledMedications.map(toDrugPayload) },
        };
        return await createInpatientTask({
          admissionSqid: effectiveAdmissionSqid,
          payload,
        });
      }

      // Outpatient / Appointment context -> send pharmacy/medication order to server
      const pharmacyPayload = {
        patient: orderContext.hin,
        order_source: orderContext.orderSource,
        drugs: filledMedications.map((med) => {
          const drugData = med.catalog_drug
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
            ...drugData,
            dosage: {
              quantity: Number(med.dosage) || 0,
              unit: med.dosageUnit,
              frequency: med.frequency,
              duration: {
                value: Number(med.duration) || 0,
                rate: med.durationUnit,
              },
            },
          };
        }),
      };

      if (orderContext.checkIn) {
        pharmacyPayload.check_in = orderContext.checkIn;
      }

      const res = await axiosInstanceHos.post(
        "api/pharmacy/orders/create",
        pharmacyPayload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-med-records"] });
      queryClient.invalidateQueries({ queryKey: ["patient-prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["inpatient-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-activities"] });
    },
    onError: (err) => {
      console.error("Error creating drug task / medication order:", err);
      toast.error(
        extractApiErrorMessage(err, "Failed to create drug task / order."),
      );
    },
  });

  // eslint-disable-next-line no-unused-vars
  const handleSubmit = ({ primary, ...shared }) => {
    const filledMedications = medications.filter(isMedicationFilled);
    if (filledMedications.length === 0) {
      toast.error("Add at least one medication with a dosage.");
      return Promise.reject(new Error("No medication rows filled in."));
    }

    return mutateAsync({ shared, filledMedications });
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
