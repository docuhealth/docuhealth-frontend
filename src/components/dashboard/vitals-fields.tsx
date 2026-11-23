import { type FieldError as FormFieldError, useFormContext, useWatch } from "react-hook-form";
import { RequiredMark } from "@/components/required-mark";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { bmiOf, type VitalsFormValues } from "@/lib/vitals-form";

type Key = keyof VitalsFormValues;

const fields: { key: Key; label: string; unit?: string; placeholder: string; core?: boolean }[] = [
  {
    key: "blood_pressure",
    label: "Blood pressure",
    unit: "mmHg",
    placeholder: "120/80",
    core: true,
  },
  { key: "temp", label: "Temperature", unit: "°C", placeholder: "36.8", core: true },
  { key: "heart_rate", label: "Heart rate", unit: "bpm", placeholder: "72", core: true },
  { key: "resp_rate", label: "Respiratory rate", unit: "/min", placeholder: "16", core: true },
  { key: "spo2", label: "SpO₂", unit: "%", placeholder: "98" },
  { key: "pain_score", label: "Pain score", unit: "/10", placeholder: "0" },
  { key: "height", label: "Height", unit: "cm", placeholder: "170" },
  { key: "weight", label: "Weight", unit: "kg", placeholder: "70" },
];

/**
 * The vital signs inputs, in a two-column grid, inside a form whose values have `vitals` (see
 * `vitalsFormSchema`; wrap the form in react-hook-form's `FormProvider`). BMI is worked out from
 * height and weight as they're typed. `core` marks the four a full set needs; `only` shows just
 * these (each then needed), e.g. the vital signs a care task asks for.
 */
export function VitalsFields({
  core = true,
  only,
  idPrefix,
}: {
  core?: boolean;
  only?: readonly Key[];
  idPrefix: string;
}) {
  const { register, control, formState } = useFormContext<{ vitals: VitalsFormValues }>();
  const [height, weight] = useWatch({ control, name: ["vitals.height", "vitals.weight"] });
  const bmi = bmiOf(height ?? "", weight ?? "");
  const errors = formState.errors.vitals as Partial<Record<Key, FormFieldError>> | undefined;

  return (
    <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
      {fields
        .filter(({ key }) => !only || only.includes(key))
        .map(({ key, label, unit, placeholder, core: coreField }) => {
          const needed = only ? true : core && coreField;
          const id = `${idPrefix}-${key}`;
          const error = errors?.[key];
          return (
            <Field key={key} data-invalid={!!error}>
              <FieldLabel htmlFor={id} className="gap-1">
                {label} {needed && <RequiredMark />}
              </FieldLabel>
              <InputGroup className="bg-card">
                <InputGroupInput
                  id={id}
                  inputMode={key === "blood_pressure" ? "text" : "decimal"}
                  autoComplete="off"
                  placeholder={placeholder}
                  aria-required={needed}
                  aria-invalid={!!error}
                  {...register(`vitals.${key}`)}
                />
                {unit && (
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>{unit}</InputGroupText>
                  </InputGroupAddon>
                )}
              </InputGroup>
              <FieldError errors={[error]} />
            </Field>
          );
        })}
      {(!only || (only.includes("height") && only.includes("weight"))) && (
        <p className="type-body-sm-regular text-fg-caption sm:col-span-2">
          BMI: {bmi === null ? "worked out from height and weight" : bmi}
        </p>
      )}
    </div>
  );
}
