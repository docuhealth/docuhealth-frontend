import { z } from "zod";
import { type careTaskTypeLabels, priorityLabels, vitalParameterLabels } from "@/lib/care-tasks";
import { frequencyLabels } from "@/features/doctor/lib/schemas";

// The doctor's care task form: what to do, when and how often, and each type's own details.

/** The task types a doctor sets (the discharge checklist comes with the discharge form). */
export const creatableTaskTypes = [
  "vital_signs",
  "medication",
  "input_output",
  "procedure",
  "glucose",
  "iv_fluid",
  "seizure_event",
] as const satisfies readonly (keyof typeof careTaskTypeLabels)[];

export const trackingModeLabels = {
  strict_24_hour_fluid_balance: "Strict 24-hour fluid balance",
  intake_only: "Intake only",
  output_only: "Output only",
} as const;

export const glucoseScheduleLabels = {
  four_point_rbs: "4-point RBS",
  six_point_rbs: "6-point RBS",
  eight_point_rbs: "8-point RBS",
  fasting_early_morning: "Fasting, early morning",
  q1h_rbs: "RBS every hour",
  q2h_rbs: "RBS every 2 hours",
  q4h_rbs: "RBS every 4 hours",
  q6h_rbs: "RBS every 6 hours",
  q8h_rbs: "RBS every 8 hours",
  post_prandial_2_hours: "2 hours after meals",
} as const;

export const solutionLabels = {
  normal_saline_09: "0.9% Normal saline",
  half_normal_saline_045: "0.45% Half-normal saline",
  dextrose_water_5: "5% Dextrose in water",
  dextrose_water_10: "10% Dextrose in water",
  dextrose_5_in_saline_09: "5% Dextrose in 0.9% saline",
  dextrose_43_in_saline_018: "4.3% Dextrose in 0.18% saline",
  ringers_lactate: "Ringer’s lactate",
  haemaccel_gelofusine: "Haemaccel / Gelofusine",
} as const;

export const bagVolumes = ["50", "100", "250", "500", "1000"] as const;

export const additiveLabels = {
  potassium_chloride: "Potassium chloride",
  magnesium_sulfate: "Magnesium sulfate",
  calcium_gluconate: "Calcium gluconate",
  sodium_bicarbonate: "Sodium bicarbonate",
  multivitamin_infusion: "Multivitamin",
  oxytocin: "Oxytocin",
  insulin: "Insulin",
  metronidazole: "Metronidazole",
  ciprofloxacin: "Ciprofloxacin",
  amoxicillin_clavulanate: "Amoxicillin-clavulanate",
  gentamicin: "Gentamicin",
  amikacin: "Amikacin",
  omeprazole: "Omeprazole",
  pantoprazole: "Pantoprazole",
  metoclopramide: "Metoclopramide",
  ondansetron: "Ondansetron",
  paracetamol: "Paracetamol",
  tramadol: "Tramadol",
  morphine: "Morphine",
  pethidine: "Pethidine",
} as const;

export const seizureTypeLabels = {
  tonic: "Tonic",
  clonic: "Clonic",
  tonic_clonic: "Tonic-clonic",
  atonic: "Atonic",
} as const;

export const standingOrderLabels = {
  none: "None",
  administer_supplemental_o2: "Give supplemental oxygen",
  iv_diazepam: "IV diazepam",
  iv_midazolam: "IV midazolam",
  pr_diazepam_suppository: "Rectal diazepam",
  iv_magnesium_sulfate_4g: "IV magnesium sulfate 4 g",
} as const;

export const taskDurationRateLabels = {
  hours: "Hours",
  days: "Days",
  weeks: "Weeks",
  months: "Months",
} as const;

const oneOf = <T extends Record<string, string>>(labels: T, message: string) =>
  z.string().refine((value) => value === "" || value in labels, message);

export const careTaskSchema = z
  .object({
    type: z.string().pipe(z.enum(creatableTaskTypes, "Choose what the task is")),
    start: z.string().min(1, "Choose when it starts"),
    // Checked below with the rest, so every missing detail shows at once.
    frequency: z.string(),
    repeatUntil: z.enum(["discharge", "duration"]),
    durationValue: z.string().trim(),
    durationRate: z.enum(
      Object.keys(taskDurationRateLabels) as ["hours", "days", "weeks", "months"],
    ),
    priority: z.enum(Object.keys(priorityLabels) as ["low", "medium", "high", "urgent"]),
    instructions: z.string().trim().max(1000, "Keep the instructions to 1,000 characters"),
    // Each type's own details; only the chosen type's are checked and sent.
    parameters: z.array(
      z.enum(Object.keys(vitalParameterLabels) as [keyof typeof vitalParameterLabels]),
    ),
    drugCode: z.string(),
    drugName: z.string().trim(),
    drugRoute: z.string().trim(),
    drugQuantity: z.string().trim(),
    drugUnit: z.string().trim(),
    trackingMode: oneOf(trackingModeLabels, "Choose what to track"),
    procedureName: z.string().trim().max(200, "Keep the name to 200 characters"),
    glucoseSchedule: oneOf(glucoseScheduleLabels, "Choose a schedule"),
    solution: oneOf(solutionLabels, "Choose the solution"),
    bagVolume: z.string(),
    totalPlan: z.string().trim(),
    infusionRate: z.string().trim(),
    additives: z.array(z.string()),
    seizureType: oneOf(seizureTypeLabels, "Choose the seizure type"),
    standingOrder: oneOf(standingOrderLabels, "Choose the standing order"),
  })
  .superRefine((task, context) => {
    const need = (ok: boolean, path: string, message: string) => {
      if (!ok) context.addIssue({ code: "custom", path: [path], message });
    };
    const positive = (value: string) => value !== "" && Number(value) > 0;
    if (task.repeatUntil === "duration") {
      need(positive(task.durationValue), "durationValue", "Enter how long, as a number above 0");
    }
    need(task.frequency in frequencyLabels, "frequency", "Choose how often");
    switch (task.type) {
      case "vital_signs":
        need(task.parameters.length > 0, "parameters", "Tick at least one vital sign");
        break;
      case "medication":
        need(task.drugName !== "", "drugName", "Pick or type the drug");
        need(task.drugCode !== "" || task.drugRoute !== "", "drugRoute", "Enter the route");
        need(positive(task.drugQuantity), "drugQuantity", "Enter the dose as a number above 0");
        need(task.drugUnit !== "", "drugUnit", "Enter the unit, e.g. mg");
        break;
      case "input_output":
        need(task.trackingMode !== "", "trackingMode", "Choose what to track");
        break;
      case "procedure":
        need(task.procedureName !== "", "procedureName", "Name the procedure");
        break;
      case "glucose":
        need(task.glucoseSchedule !== "", "glucoseSchedule", "Choose a schedule");
        break;
      case "iv_fluid":
        need(task.solution !== "", "solution", "Choose the solution");
        need(task.bagVolume !== "", "bagVolume", "Choose the bag size");
        need(positive(task.totalPlan), "totalPlan", "Enter the total volume in ml");
        need(positive(task.infusionRate), "infusionRate", "Enter the rate in ml/hour");
        break;
      case "seizure_event":
        need(task.seizureType !== "", "seizureType", "Choose the seizure type");
        need(task.standingOrder !== "", "standingOrder", "Choose the standing order");
        break;
    }
  });
export type CareTaskInput = z.input<typeof careTaskSchema>;
export type CareTaskValues = z.output<typeof careTaskSchema>;

/** Now, rounded up to the next 5 minutes, as a `datetime-local` value. */
function soon() {
  const date = new Date(Math.ceil(Date.now() / 300_000) * 300_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const emptyCareTask = (): CareTaskInput => ({
  type: "",
  start: soon(),
  frequency: "",
  repeatUntil: "discharge",
  durationValue: "",
  durationRate: "days",
  priority: "medium",
  instructions: "",
  parameters: ["blood_pressure", "temp", "heart_rate", "resp_rate"],
  drugCode: "",
  drugName: "",
  drugRoute: "Oral",
  drugQuantity: "",
  drugUnit: "mg",
  trackingMode: "",
  procedureName: "",
  glucoseSchedule: "",
  solution: "",
  bagVolume: "",
  totalPlan: "",
  infusionRate: "",
  additives: [],
  seizureType: "",
  standingOrder: "",
});

/** The form as `POST /api/inpatients/admissions/{sqid}/tasks` takes it. */
export function toCareTaskRequest(task: CareTaskValues) {
  const config = (() => {
    switch (task.type) {
      case "vital_signs":
        return { parameters: task.parameters };
      case "medication":
        return {
          drugs: [
            {
              ...(task.drugCode
                ? { catalog_drug: task.drugCode }
                : { manual_drug: { name: task.drugName, route: task.drugRoute } }),
              dosage: {
                quantity: Number(task.drugQuantity),
                unit: task.drugUnit,
                frequency: task.frequency,
              },
            },
          ],
        };
      case "input_output":
        return { tracking_mode: task.trackingMode };
      case "procedure":
        return { procedure_name: task.procedureName };
      case "glucose":
        return { schedule: task.glucoseSchedule };
      case "iv_fluid":
        return {
          solution_type: task.solution,
          volume_per_bag: Number(task.bagVolume),
          total_plan: Number(task.totalPlan),
          infusion_rate: Number(task.infusionRate),
          additives: task.additives,
        };
      case "seizure_event":
        return {
          characteristics: task.seizureType,
          emergency_standing_order: task.standingOrder,
        };
    }
  })();
  return {
    task_type: task.type,
    start_time: new Date(task.start).toISOString(),
    frequency: task.frequency,
    repeat_until: task.repeatUntil,
    duration:
      task.repeatUntil === "duration"
        ? { value: Number(task.durationValue), rate: task.durationRate }
        : null,
    priority: task.priority,
    instructions: task.instructions,
    config,
  };
}
