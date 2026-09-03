import React, { useState } from "react";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import TaskCreationModal, { FIELD_BOX_CLASS, FIELD_LABEL_CLASS } from "./TaskCreationModal";
import { createInpatientTask } from "../../../../../../queries/Hospital/doctor/inpatientTasks";
import Input from "../../../../../ui/Input";
import Select from "../../../../../ui/Select";

// Backend enums for an `iv_fluid` care task's `config` (labels mirror the
// Swagger descriptions).
const SOLUTION_TYPE_OPTIONS = [
  { value: "normal_saline_09", label: "0.9% Normal Saline" },
  { value: "dextrose_water_5", label: "5% Dextrose Water" },
  { value: "dextrose_water_10", label: "10% Dextrose Water" },
  { value: "dextrose_5_in_saline_09", label: "5% Dextrose in 0.9% Normal Saline" },
  { value: "ringers_lactate", label: "Ringer's Lactate" },
  { value: "dextrose_43_in_saline_018", label: "4.3% Dextrose in 0.18% Saline" },
  { value: "haemaccel_gelofusine", label: "Haemaccel / Gelofusine" },
  { value: "half_normal_saline_045", label: "0.45% Half-Normal Saline" },
];

const VOLUME_PER_BAG_OPTIONS = [
  { value: "50", label: "50 mL" },
  { value: "100", label: "100 mL" },
  { value: "250", label: "250 mL" },
  { value: "500", label: "500 mL" },
  { value: "1000", label: "1,000 mL" },
];

const ADDITIVE_OPTIONS = [
  { value: "potassium_chloride", label: "Potassium Chloride" },
  { value: "magnesium_sulfate", label: "Magnesium Sulfate" },
  { value: "calcium_gluconate", label: "Calcium Gluconate" },
  { value: "sodium_bicarbonate", label: "Sodium Bicarbonate" },
  { value: "multivitamin_infusion", label: "Multivitamin Infusion (MVI)" },
  { value: "oxytocin", label: "Oxytocin" },
  { value: "insulin", label: "Insulin (Regular / Actrapid)" },
  { value: "metronidazole", label: "Metronidazole (Flagyl)" },
  { value: "ciprofloxacin", label: "Ciprofloxacin" },
  { value: "amoxicillin_clavulanate", label: "Amoxicillin-Clavulanate (Augmentin)" },
  { value: "gentamicin", label: "Gentamicin" },
  { value: "amikacin", label: "Amikacin" },
  { value: "omeprazole", label: "Omeprazole" },
  { value: "pantoprazole", label: "Pantoprazole" },
  { value: "metoclopramide", label: "Metoclopramide (Maxolon)" },
  { value: "ondansetron", label: "Ondansetron" },
  { value: "paracetamol", label: "Paracetamol (Perfalgan)" },
  { value: "tramadol", label: "Tramadol" },
  { value: "morphine", label: "Morphine" },
  { value: "pethidine", label: "Pethidine" },
];

const additiveLabel = (value) =>
  ADDITIVE_OPTIONS.find((o) => o.value === value)?.label || value;

const IVFluidTopSection = ({
  additives,
  onAddAdditive,
  onRemoveAdditive,
  solutionType,
  setSolutionType,
  volumePerBag,
  setVolumePerBag,
  totalPlan,
  setTotalPlan,
  infusionRate,
  setInfusionRate,
}) => {
  const availableAdditives = ADDITIVE_OPTIONS.filter(
    (option) => !additives.includes(option.value),
  );

  return (
    <>
      <div className={FIELD_BOX_CLASS}>
        <label className={FIELD_LABEL_CLASS}>Drugs / Additives (optional)</label>
        <Select
          value=""
          onChange={(value) => {
            if (value) onAddAdditive(value);
          }}
          options={availableAdditives}
          placeholder="Add a drug / additive"
        />

        {additives.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {additives.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-3 pr-2 py-1.5 text-[13px] text-gray-600"
              >
                {additiveLabel(item)}
                <button
                  type="button"
                  onClick={() => onRemoveAdditive(item)}
                  className="text-red-500 hover:text-red-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className={FIELD_BOX_CLASS}>
          <label className={FIELD_LABEL_CLASS}>Fluid solution type<span className="text-red-500"> *</span></label>
          <Select
            value={solutionType}
            onChange={setSolutionType}
            options={SOLUTION_TYPE_OPTIONS}
            placeholder="Select solution type"
          />
        </div>

        <div className={FIELD_BOX_CLASS}>
          <label className={FIELD_LABEL_CLASS}>Volume per bag<span className="text-red-500"> *</span></label>
          <Select
            value={volumePerBag}
            onChange={setVolumePerBag}
            options={VOLUME_PER_BAG_OPTIONS}
            placeholder="Select volume"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className={FIELD_BOX_CLASS}>
          <label className={FIELD_LABEL_CLASS}>Total bags planned<span className="text-red-500"> *</span></label>
          <Input
            type="number"
            min="1"
            placeholder="e.g. 3"
            value={totalPlan}
            onChange={(e) => setTotalPlan(e.target.value)}
          />
        </div>

        <div className={FIELD_BOX_CLASS}>
          <label className={FIELD_LABEL_CLASS}>Infusion rate (mL / hour)<span className="text-red-500"> *</span></label>
          <Input
            type="number"
            min="1"
            placeholder="e.g. 125"
            value={infusionRate}
            onChange={(e) => setInfusionRate(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

/**
 * "IV fluid" quick-service flow from OtherMedicalServicesFab. Creates an
 * `iv_fluid` care task on the patient's admission via
 * POST /api/inpatients/admissions/<sqid>/tasks. It needs a
 * drugs/additive multi-picker plus fluid-specific fields, so it plugs a
 * custom top section into the shared TaskCreationModal shell; `frequency`
 * (required by the backend for this task type) and the rest of the shared
 * fields still come from the shell.
 */
const IVFluidModal = ({ admissionSqid, onClose }) => {
  const [additives, setAdditives] = useState([]);
  const [solutionType, setSolutionType] = useState(SOLUTION_TYPE_OPTIONS[0].value);
  const [volumePerBag, setVolumePerBag] = useState("500");
  const [totalPlan, setTotalPlan] = useState("1");
  const [infusionRate, setInfusionRate] = useState("");

  const addAdditive = (item) => setAdditives((prev) => [...prev, item]);
  const removeAdditive = (item) =>
    setAdditives((prev) => prev.filter((existing) => existing !== item));

  const isTopSectionValid =
    !!solutionType &&
    !!volumePerBag &&
    Number(totalPlan) >= 1 &&
    Number(infusionRate) >= 1;

  const { mutateAsync } = useMutation({
    mutationFn: (payload) => createInpatientTask({ admissionSqid, payload }),
    onError: (err) => {
      console.error("Error creating IV fluid task:", err);
      toast.error(err.response?.data?.message || "Failed to create IV fluid task.");
    },
  });

  const handleSubmit = (fields) => {
    // iv_fluid has no shared "primary" select — only the custom topSection.
    // eslint-disable-next-line no-unused-vars
    const { primary, ...shared } = fields;
    return mutateAsync({
      task_type: "iv_fluid",
      config: {
        solution_type: solutionType,
        volume_per_bag: Number(volumePerBag),
        total_plan: Number(totalPlan),
        infusion_rate: Number(infusionRate),
        ...(additives.length ? { additives } : {}),
      },
      ...shared,
    });
  };

  return (
    <TaskCreationModal
      title="IV Fluid Task"
      topSection={
        <IVFluidTopSection
          additives={additives}
          onAddAdditive={addAdditive}
          onRemoveAdditive={removeAdditive}
          solutionType={solutionType}
          setSolutionType={setSolutionType}
          volumePerBag={volumePerBag}
          setVolumePerBag={setVolumePerBag}
          totalPlan={totalPlan}
          setTotalPlan={setTotalPlan}
          infusionRate={infusionRate}
          setInfusionRate={setInfusionRate}
        />
      }
      isTopSectionValid={isTopSectionValid}
      frequencyLabel="Frequency / Timing"
      successMessage="IV fluid task created!"
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
};

export default IVFluidModal;
