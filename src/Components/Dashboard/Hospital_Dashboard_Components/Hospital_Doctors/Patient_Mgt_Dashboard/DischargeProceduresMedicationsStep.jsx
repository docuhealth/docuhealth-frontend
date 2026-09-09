import React from "react";
import { Plus } from "lucide-react";
import MedicationSection from "../Appointments_Dashboard/components/MedicationSection";
import DischargeMedicationsTable from "./DischargeMedicationsTable";
import DischargeInvestigationPicker from "./DischargeInvestigationPicker";
import Select from "../../../../ui/Select";

const conditionOptions = ["Stable", "Improved", "Unchanged", "Deteriorated", "Deceased"];

const DischargeProceduresMedicationsStep = ({
  completedInvestigationOptions,
  formData,
  onFieldChange,
  onToggleCompletedInvestigation,
  existingMedications,
  setExistingMedications,
  showAddMedication,
  setShowAddMedication,
  newMedications,
  setNewMedications,
}) => {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <div className="border border-gray-200 rounded-xl p-5 lg:p-6">
        <h3 className="font-semibold text-docuhealth-primary mb-4 text-[15px]">
          Procedures &amp; Investigation Selection
        </h3>
        <DischargeInvestigationPicker
          label="Select completed investigations"
          placeholder="Select completed investigations"
          options={completedInvestigationOptions}
          selected={formData.completed_investigations}
          onToggle={onToggleCompletedInvestigation}
        />
      </div>

      <div className="border border-gray-200 rounded-xl p-5 lg:p-6">
        <h3 className="font-semibold text-docuhealth-primary mb-3 text-[15px]">
          Condition at discharge<span className="text-red-500"> *</span>
        </h3>
        <Select
          value={formData.condition_at_discharge}
          onChange={(value) => onFieldChange("condition_at_discharge", value)}
          options={conditionOptions.map((opt) => ({ value: opt, label: opt }))}
          placeholder="Select condition"
          className="md:w-1/2"
        />
      </div>

      <div className="border border-gray-200 rounded-xl p-5 lg:p-6">
        <div className="flex justify-between items-center mb-4 gap-3">
          <h3 className="font-semibold text-docuhealth-primary text-[15px]">
            Discharge medications
          </h3>
          <button
            type="button"
            onClick={() => setShowAddMedication((prev) => !prev)}
            className="flex items-center gap-1.5 border border-docuhealth-primary text-docuhealth-primary rounded-full px-4 py-1.5 text-[12px] font-medium hover:bg-docuhealth-primary/5 whitespace-nowrap"
          >
            <Plus size={13} />
            {showAddMedication ? "Hide new medication form" : "Add new medications for discharge"}
          </button>
        </div>

        <DischargeMedicationsTable
          medications={existingMedications}
          setMedications={setExistingMedications}
        />

        {showAddMedication && (
          <div className="mt-4">
            <MedicationSection medications={newMedications} setMedications={setNewMedications} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DischargeProceduresMedicationsStep;
