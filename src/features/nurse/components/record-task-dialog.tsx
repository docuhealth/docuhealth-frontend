import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { VitalsFields } from "@/components/dashboard/vitals-fields";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type TaskOccurrence, useRecordTask } from "@/features/nurse/api/tasks";
import { getErrorMessage } from "@/lib/api";
import { careTaskTypeLabel } from "@/lib/care-tasks";
import {
  emptyVitals,
  toVitalSignsWrite,
  type VitalsFormValues,
  vitalsFormSchema,
} from "@/lib/vitals-form";
import { z } from "zod";

// What a nurse records for each kind of care task (`POST …/task-occurrences/{sqid}/execute`).
// TODO(api): only described in words in the schema; the fields and options follow v1.

type Kind = "select" | "number" | "text" | "long" | "check" | "time";
type FieldSpec = {
  name: string;
  label: string;
  kind: Kind;
  options?: Record<string, string>;
  required?: boolean;
  placeholder?: string;
  /** Which part of an intake/output record it belongs to. */
  section?: "intake" | "output";
};

const glucose: FieldSpec[] = [
  { name: "value", label: "Reading", kind: "number", required: true, placeholder: "110" },
  {
    name: "unit",
    label: "Unit",
    kind: "select",
    required: true,
    options: { mg_dl: "mg/dL", mmol_l: "mmol/L" },
  },
  {
    name: "context",
    label: "When",
    kind: "select",
    required: true,
    options: {
      fasting: "Fasting",
      pre_meal: "Before a meal",
      post_meal: "After a meal",
      bedtime: "Bedtime",
      random: "Random",
    },
  },
  { name: "insulin_administered", label: "Insulin given", kind: "check" },
];

const procedure: FieldSpec[] = [
  {
    name: "consent",
    label: "Consent",
    kind: "select",
    required: true,
    options: { given: "Given", emergency: "Emergency (no consent possible)" },
  },
  {
    name: "post_procedure_status",
    label: "Site after the procedure",
    kind: "select",
    required: true,
    options: {
      clean_dry: "Clean and dry",
      oozing_bleeding: "Oozing or bleeding",
      leakage: "Leaking",
    },
  },
  {
    name: "estimated_blood_volume_ml",
    label: "Estimated blood loss (ml)",
    kind: "number",
    required: true,
    placeholder: "0",
  },
  {
    name: "current_position",
    label: "Patient’s position",
    kind: "select",
    required: true,
    options: { head_of_bed_elevated: "Head of bed elevated", flat_supine: "Flat, on their back" },
  },
];

const ivFluid: FieldSpec[] = [
  {
    name: "site_condition",
    label: "IV site",
    kind: "select",
    required: true,
    options: {
      clean: "Clean",
      swollen_leaking: "Swollen or leaking",
      red_painful: "Red or painful",
      line_blocked: "Line blocked",
    },
  },
  {
    name: "cannula_location",
    label: "Cannula",
    kind: "select",
    required: true,
    options: {
      left_forearm: "Left forearm",
      right_forearm: "Right forearm",
      left_hand: "Left hand",
      right_hand: "Right hand",
    },
  },
  { name: "add_to_patient_fluid_chart", label: "Count it on the fluid chart", kind: "check" },
  { name: "nursing_remark", label: "Remark", kind: "long" },
];

const seizure: FieldSpec[] = [
  { name: "duration_minutes", label: "Minutes", kind: "number", required: true, placeholder: "1" },
  { name: "duration_seconds", label: "Seconds", kind: "number", required: true, placeholder: "30" },
  {
    name: "physical_signs",
    label: "Signs",
    kind: "select",
    options: {
      frothing: "Frothing",
      tongue_biting: "Tongue biting",
      eye_rolling: "Eye rolling",
      incontinence: "Incontinence",
    },
  },
  {
    name: "body_parts_involved",
    label: "Body parts",
    kind: "select",
    options: {
      generalized: "Whole body",
      left_side_only: "Left side only",
      right_side_only: "Right side only",
      left_arm: "Left arm",
      right_arm: "Right arm",
      left_leg: "Left leg",
      right_leg: "Right leg",
    },
  },
  {
    name: "level_of_consciousness",
    label: "Consciousness during it",
    kind: "select",
    options: {
      preserved_alert: "Preserved, alert",
      impaired_confused: "Impaired, confused",
      completely_unconscious: "Completely unconscious",
      did_not_regain: "Didn’t regain consciousness",
    },
  },
  {
    name: "patient_reaction",
    label: "Afterwards",
    kind: "select",
    options: {
      awake_alert: "Awake and alert",
      somnolent: "Sleepy, lethargic",
      confused_agitated: "Confused or agitated",
      temporarily_weak_paralyzed: "Weak or paralysed for a while",
    },
  },
  { name: "interventions_administered", label: "What was done", kind: "long" },
];

const intake: FieldSpec[] = [
  {
    name: "source",
    label: "Source",
    kind: "select",
    required: true,
    section: "intake",
    options: {
      oral_free_fluids: "Oral fluids",
      enteral_nutrition: "Tube feed",
      iv_fluids: "IV fluids",
      iv_medications: "IV medications",
      blood_products: "Blood products",
      dialysate: "Dialysate",
    },
  },
  {
    name: "fluid_feed",
    label: "Fluid",
    kind: "select",
    required: true,
    section: "intake",
    options: {
      water: "Water",
      clear_liquids: "Clear liquids",
      full_liquids: "Full liquids",
      oral_rehydration_salt: "ORS",
      standard_polymeric_feed: "Standard feed",
      high_protein_formula: "High-protein formula",
      diabetic_formula: "Diabetic formula",
      renal_formula: "Renal formula",
      blenderized_diet_ebm: "Blended diet / breast milk",
      normal_saline: "0.9% Normal saline",
      dextrose_water_5: "5% Dextrose",
      dextrose_water_10: "10% Dextrose",
      dextrose_saline: "Dextrose saline",
      ringers_lactate: "Ringer’s lactate",
      half_normal_saline: "0.45% Saline",
      whole_blood: "Whole blood",
      packed_red_blood_cells: "Packed red cells",
      fresh_frozen_plasma: "Fresh frozen plasma",
      platelet_concentrate: "Platelets",
      cryoprecipitate_albumin: "Cryoprecipitate / albumin",
    },
  },
  {
    name: "route",
    label: "Route",
    kind: "select",
    required: true,
    section: "intake",
    options: {
      oral: "Oral",
      nasogastric_tube: "NG tube",
      orogastric_tube: "OG tube",
      peg_tube: "PEG tube",
      jejunostomy_tube: "J-tube",
      peripheral_iv_line: "Peripheral IV",
      central_venous_catheter: "Central line",
      picc_line: "PICC line",
      subcutaneous: "Subcutaneous",
    },
  },
  {
    name: "volume_ml",
    label: "Volume (ml)",
    kind: "number",
    required: true,
    section: "intake",
    placeholder: "200",
  },
  { name: "recorded_at", label: "Time", kind: "time", required: true, section: "intake" },
];

const output: FieldSpec[] = [
  {
    name: "output_type",
    label: "Output",
    kind: "select",
    required: true,
    section: "output",
    options: {
      urine: "Urine",
      stool_bowel: "Stool",
      vomitus_emesis: "Vomit",
      ng_gastric_suction: "NG / gastric suction",
      surgical_wound_drain: "Surgical drain",
      chest_tube_drainage: "Chest tube",
      ascitic_peritoneal_fluid: "Ascitic fluid",
      sputum_exudate: "Sputum",
      csf_drainage: "CSF drain",
    },
  },
  {
    name: "characteristics",
    label: "Looks like",
    kind: "text",
    section: "output",
    placeholder: "e.g. Clear, straw-coloured",
  },
  {
    name: "volume_ml",
    label: "Volume (ml)",
    kind: "number",
    required: true,
    section: "output",
    placeholder: "300",
  },
  { name: "recorded_at", label: "Time", kind: "time", required: true, section: "output" },
  { name: "nursing_remark", label: "Remark", kind: "long", section: "output" },
];

/**
 * Record a claimed care task: the vital signs asked for, or the type's own details. A medication
 * is confirmed instead, and the discharge checklist has its own form.
 */
export function RecordTaskDialog({
  task,
  onClose,
}: {
  task: TaskOccurrence | null;
  onClose: () => void;
}) {
  return (
    <FormDialog open={!!task} onOpenChange={(open) => !open && onClose()}>
      {task &&
        (task.type === "vital_signs" ? (
          <VitalsTaskForm task={task} onDone={onClose} />
        ) : (
          <DetailsTaskForm task={task} onDone={onClose} />
        ))}
    </FormDialog>
  );
}

const nowLocal = () => {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function VitalsTaskForm({ task, onDone }: { task: TaskOccurrence; onDone: () => void }) {
  const record = useRecordTask();
  // The vital signs the doctor asked for; all of them when the task doesn't say.
  const asked = task.parameters.length
    ? task.parameters
    : (Object.keys(emptyVitals) as (keyof VitalsFormValues)[]);
  const schema = z.object({
    vitals: vitalsFormSchema(false).superRefine((vitals, context) => {
      for (const key of asked) {
        if (!vitals[key])
          context.addIssue({ code: "custom", path: [key], message: "Enter this reading" });
      }
    }),
  });
  const form = useForm<{ vitals: VitalsFormValues }>({
    resolver: zodResolver(schema),
    defaultValues: { vitals: emptyVitals },
  });

  function onSubmit({ vitals }: { vitals: VitalsFormValues }) {
    const all = toVitalSignsWrite(vitals);
    // Only what was asked for: the API refuses anything else.
    const body = Object.fromEntries(asked.map((key) => [key, all[key]]));
    record.mutate(
      { id: task.id, record: body },
      {
        onSuccess: () => {
          toast.success(`${task.patient.name}’s vital signs are recorded.`);
          onDone();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <FormDialogHeader
          title="Record vital signs"
          description={`${task.patient.name}: ${task.summary ?? "vital signs"}.`}
        />
        <FormDialogBody>
          <VitalsFields idPrefix="task-vitals" only={asked} />
        </FormDialogBody>
        <FormDialogFooter>
          <Button type="submit" loading={record.isPending} className="h-11 px-5 type-heading-sm">
            Record
          </Button>
        </FormDialogFooter>
      </form>
    </FormProvider>
  );
}

/** The fields to fill for a task, by its type (and, for intake/output, what it tracks). */
function fieldsFor(task: TaskOccurrence): FieldSpec[] {
  switch (task.type) {
    case "glucose":
      return glucose;
    case "procedure":
      return procedure;
    case "iv_fluid":
      return ivFluid;
    case "seizure_event":
      return seizure;
    case "input_output":
      if (task.trackingMode === "intake_only") return intake;
      if (task.trackingMode === "output_only") return output;
      return [...intake, ...output];
    default:
      return [];
  }
}

const keyOf = (field: FieldSpec) => (field.section ? `${field.section}.${field.name}` : field.name);

function DetailsTaskForm({ task, onDone }: { task: TaskOccurrence; onDone: () => void }) {
  const record = useRecordTask();
  const fields = fieldsFor(task);
  const both =
    task.type === "input_output" &&
    task.trackingMode !== "intake_only" &&
    task.trackingMode !== "output_only";
  const [values, setValues] = useState<Record<string, string | boolean>>(() =>
    Object.fromEntries(
      fields.map((field) => [
        keyOf(field),
        field.kind === "check"
          ? field.name === "add_to_patient_fluid_chart"
          : field.kind === "time"
            ? nowLocal()
            : "",
      ]),
    ),
  );
  // With both parts, either may be left out (but not both).
  const [skip, setSkip] = useState<{ intake: boolean; output: boolean }>({
    intake: false,
    output: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const found: Record<string, string> = {};
    for (const field of fields) {
      if (field.section && skip[field.section]) continue;
      const value = values[keyOf(field)];
      if (field.required && (value === "" || value === undefined))
        found[keyOf(field)] = `Enter the ${field.label.toLowerCase()}`;
      else if (field.kind === "number" && value !== "" && !(Number(value) >= 0))
        found[keyOf(field)] = "Enter a number";
    }
    setErrors(found);
    return Object.keys(found).length === 0;
  }

  function body() {
    const read = (field: FieldSpec) => {
      const value = values[keyOf(field)];
      if (field.kind === "check") return !!value;
      if (field.kind === "number") return value === "" ? undefined : Number(value);
      if (field.kind === "time") return value ? new Date(String(value)).toISOString() : undefined;
      return value === "" ? null : value;
    };
    if (task.type !== "input_output") {
      return Object.fromEntries(fields.map((field) => [field.name, read(field)]));
    }
    const part = (section: "intake" | "output") =>
      skip[section] || !fields.some((field) => field.section === section)
        ? undefined
        : Object.fromEntries(
            fields
              .filter((field) => field.section === section)
              .map((field) => [field.name, read(field)]),
          );
    return { intake: part("intake"), output: part("output") };
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (both && skip.intake && skip.output) {
      toast.error("Record the intake, the output, or both.");
      return;
    }
    if (!validate()) return;
    record.mutate(
      { id: task.id, record: body() },
      {
        onSuccess: () => {
          toast.success(
            `${task.patient.name}’s ${careTaskTypeLabel(task.type).toLowerCase()} is recorded.`,
          );
          onDone();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  const sections: { title: string | null; section?: "intake" | "output" }[] =
    task.type === "input_output"
      ? [
          ...(fields.some((field) => field.section === "intake")
            ? [{ title: "Intake", section: "intake" as const }]
            : []),
          ...(fields.some((field) => field.section === "output")
            ? [{ title: "Output", section: "output" as const }]
            : []),
        ]
      : [{ title: null }];

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <FormDialogHeader
        title={`Record ${careTaskTypeLabel(task.type).toLowerCase()}`}
        description={[task.patient.name, task.summary].filter(Boolean).join(": ")}
      />
      <FormDialogBody>
        {sections.map(({ title, section }) => (
          <FieldSet key={title ?? "details"} className="flex flex-col gap-4">
            {title && (
              <div className="flex items-center justify-between gap-3">
                <FieldLegend variant="label">{title}</FieldLegend>
                {both && section && (
                  <Field orientation="horizontal" className="w-auto">
                    <Checkbox
                      id={`skip-${section}`}
                      checked={skip[section]}
                      onCheckedChange={(checked) =>
                        setSkip({ ...skip, [section]: checked === true })
                      }
                    />
                    <FieldLabel htmlFor={`skip-${section}`} className="font-normal">
                      Nothing to record
                    </FieldLabel>
                  </Field>
                )}
              </div>
            )}
            {!(section && skip[section]) &&
              fields
                .filter((field) => field.section === section)
                .map((field) => (
                  <DetailField
                    key={keyOf(field)}
                    field={field}
                    value={values[keyOf(field)] ?? ""}
                    error={errors[keyOf(field)]}
                    onChange={(value) => setValues({ ...values, [keyOf(field)]: value })}
                  />
                ))}
          </FieldSet>
        ))}
      </FormDialogBody>
      <FormDialogFooter>
        <Button type="submit" loading={record.isPending} className="h-11 px-5 type-heading-sm">
          Record
        </Button>
      </FormDialogFooter>
    </form>
  );
}

function DetailField({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldSpec;
  value: string | boolean;
  error?: string;
  onChange: (value: string | boolean) => void;
}) {
  const id = `record-${keyOf(field).replace(".", "-")}`;
  if (field.kind === "check") {
    return (
      <Field orientation="horizontal">
        <Checkbox
          id={id}
          checked={!!value}
          onCheckedChange={(checked) => onChange(checked === true)}
        />
        <FieldLabel htmlFor={id} className="font-normal">
          {field.label}
        </FieldLabel>
      </Field>
    );
  }
  const label = (
    <FieldLabel htmlFor={id} className="gap-1">
      {field.label} {field.required && <RequiredMark />}
    </FieldLabel>
  );
  const errorText = <FieldError errors={[error ? { message: error } : undefined]} />;
  if (field.kind === "select" && field.options) {
    return (
      <Field data-invalid={!!error}>
        {label}
        <Select
          items={field.options}
          value={(value as string) || null}
          onValueChange={(next) => onChange(next ?? "")}
        >
          <SelectTrigger id={id} aria-invalid={!!error} className="w-full bg-card">
            <SelectValue placeholder="Choose" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(field.options).map(([option, text]) => (
              <SelectItem key={option} value={option}>
                {text}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errorText}
      </Field>
    );
  }
  if (field.kind === "long") {
    return (
      <Field data-invalid={!!error}>
        {label}
        <Textarea
          id={id}
          value={value as string}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-16 bg-card"
        />
        {errorText}
      </Field>
    );
  }
  return (
    <Field data-invalid={!!error}>
      {label}
      <Input
        id={id}
        type={field.kind === "time" ? "datetime-local" : "text"}
        inputMode={field.kind === "number" ? "decimal" : undefined}
        placeholder={field.placeholder}
        aria-invalid={!!error}
        value={value as string}
        onChange={(event) => onChange(event.target.value)}
        className="bg-card"
      />
      {errorText}
    </Field>
  );
}
