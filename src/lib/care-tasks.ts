// Inpatient care tasks, as both the doctor (who sets them) and the nurse (who does them) name them.

export const careTaskTypeLabels = {
  vital_signs: "Vital signs",
  medication: "Medication",
  input_output: "Fluid intake and output",
  procedure: "Procedure",
  glucose: "Blood glucose",
  iv_fluid: "IV fluid",
  seizure_event: "Seizure watch",
  nurse_in_patient_discharge: "Discharge checklist",
} as const;
export type CareTaskType = keyof typeof careTaskTypeLabels;

/** The task type in words, or the API's own word for one it adds later. */
export const careTaskTypeLabel = (type: string) =>
  careTaskTypeLabels[type as CareTaskType] ?? type.replaceAll("_", " ");

export const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
} as const;
export type Priority = keyof typeof priorityLabels;

export const priorityTones = {
  low: "neutral",
  medium: "info",
  high: "warning",
  urgent: "error",
} as const satisfies Record<Priority, string>;

/** The vital signs a vitals task can ask for, as the API names them. */
export const vitalParameterLabels = {
  blood_pressure: "Blood pressure",
  temp: "Temperature",
  heart_rate: "Heart rate",
  resp_rate: "Respiratory rate",
  spo2: "SpO₂",
  pain_score: "Pain score",
  height: "Height",
  weight: "Weight",
} as const;
export type VitalParameter = keyof typeof vitalParameterLabels;
