import React, { useState } from "react";
import { X } from "lucide-react";
import TaskCreationModal, { FIELD_BOX_CLASS, FIELD_LABEL_CLASS } from "./TaskCreationModal";
import Select from "../../../../../ui/Select";

const DRUG_ADDITIVE_OPTIONS = [
  "Potassium Chloride (KCl)",
  "Multivitamin Infusion",
  "Insulin (Sliding Scale)",
  "Magnesium Sulfate",
  "Sodium Bicarbonate",
  "Calcium Gluconate",
];

const FLUID_SOLUTION_OPTIONS = [
  "Normal saline",
  "Dextrose 5% (D5W)",
  "Dextrose Saline",
  "Ringer's Lactate",
  "Half Normal Saline (0.45% NaCl)",
  "Dextrose 10%",
];

const VOLUME_PER_BAG_OPTIONS = ["100 mL", "250 mL", "500 mL", "1000 mL"];

const TOTAL_PLAN_OPTIONS = ["1 Bag Only", "2 Bags", "3 Bags", "Continuous / Until further notice"];

const INFUSION_DURATION_OPTIONS = [
  "4 hours",
  "8 hours",
  "12 hours",
  "24 hours",
  "48 hours",
  "Until discontinued",
];

const IVFluidTopSection = ({
  drugsAdditive,
  onAddAdditive,
  onRemoveAdditive,
  fluidType,
  setFluidType,
  volumePerBag,
  setVolumePerBag,
  totalPlan,
  setTotalPlan,
  infusionDuration,
  setInfusionDuration,
}) => {
  const availableAdditives = DRUG_ADDITIVE_OPTIONS.filter(
    (option) => !drugsAdditive.includes(option)
  );

  return (
    <>
      <div className={FIELD_BOX_CLASS}>
        <label className={FIELD_LABEL_CLASS}>Drugs/Additive</label>
        <Select
          value=""
          onChange={(value) => {
            if (value) onAddAdditive(value);
          }}
          options={availableAdditives.map((option) => ({ value: option, label: option }))}
          placeholder="Select drugs/additive"
        />

        {drugsAdditive.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {drugsAdditive.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-3 pr-2 py-1.5 text-[13px] text-gray-600"
              >
                {item}
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
          <label className={FIELD_LABEL_CLASS}>Fluid solution type</label>
          <Select
            value={fluidType}
            onChange={setFluidType}
            options={FLUID_SOLUTION_OPTIONS.map((option) => ({ value: option, label: option }))}
          />
        </div>

        <div className={FIELD_BOX_CLASS}>
          <label className={FIELD_LABEL_CLASS}>Volume per bag</label>
          <Select
            value={volumePerBag}
            onChange={setVolumePerBag}
            options={VOLUME_PER_BAG_OPTIONS.map((option) => ({ value: option, label: option }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className={FIELD_BOX_CLASS}>
          <label className={FIELD_LABEL_CLASS}>Total Plan / Number of Bags</label>
          <Select
            value={totalPlan}
            onChange={setTotalPlan}
            options={TOTAL_PLAN_OPTIONS.map((option) => ({ value: option, label: option }))}
          />
        </div>

        <div className={FIELD_BOX_CLASS}>
          <label className={FIELD_LABEL_CLASS}>Infusion Rate / Duration</label>
          <Select
            value={infusionDuration}
            onChange={setInfusionDuration}
            options={INFUSION_DURATION_OPTIONS.map((option) => ({ value: option, label: option }))}
          />
        </div>
      </div>
    </>
  );
};

/**
 * "IV fluid" quick-service flow from OtherMedicalServicesFab. Needs a
 * drugs/additive multi-picker plus its own fluid-specific fields, so it
 * plugs a custom top section into the shared TaskCreationModal shell
 * instead of using the default single primary field. There's no backend
 * endpoint for this yet, so "Create this task" just confirms locally —
 * swap in a real mutation once the API exists.
 */
const IVFluidModal = ({ onClose }) => {
  const [drugsAdditive, setDrugsAdditive] = useState([]);
  const [fluidType, setFluidType] = useState(FLUID_SOLUTION_OPTIONS[0]);
  const [volumePerBag, setVolumePerBag] = useState("500 mL");
  const [totalPlan, setTotalPlan] = useState(TOTAL_PLAN_OPTIONS[0]);
  const [infusionDuration, setInfusionDuration] = useState("24 hours");

  const handleAddAdditive = (item) => setDrugsAdditive((prev) => [...prev, item]);
  const handleRemoveAdditive = (item) =>
    setDrugsAdditive((prev) => prev.filter((existing) => existing !== item));

  const isTopSectionValid = !!fluidType && !!volumePerBag && !!totalPlan && !!infusionDuration;

  return (
    <TaskCreationModal
      title="IV fluid Task"
      topSection={
        <IVFluidTopSection
          drugsAdditive={drugsAdditive}
          onAddAdditive={handleAddAdditive}
          onRemoveAdditive={handleRemoveAdditive}
          fluidType={fluidType}
          setFluidType={setFluidType}
          volumePerBag={volumePerBag}
          setVolumePerBag={setVolumePerBag}
          totalPlan={totalPlan}
          setTotalPlan={setTotalPlan}
          infusionDuration={infusionDuration}
          setInfusionDuration={setInfusionDuration}
        />
      }
      isTopSectionValid={isTopSectionValid}
      showFrequencyDuration={false}
      successMessage="IV fluid task created!"
      onClose={onClose}
    />
  );
};

export default IVFluidModal;
