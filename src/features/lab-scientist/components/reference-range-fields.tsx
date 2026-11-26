import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Controller, type UseFormReturn, useFieldArray } from "react-hook-form";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  ageGroupLabels,
  pregnancyLabels,
  referenceGenderLabels,
} from "@/features/lab-scientist/api/schemas";
import { SelectField } from "@/features/lab-scientist/components/select-field";
import { newReferenceRange, type TestDetailsValues } from "@/features/lab-scientist/lib/schemas";

/**
 * The test's normal ranges, one per group of patients (age, sex, pregnancy), at least one. What
 * the admin sends replaces every range saved before.
 */
export function ReferenceRangeFields({ form }: { form: UseFormReturn<TestDetailsValues> }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "references" });
  const { errors } = form.formState;

  return (
    <fieldset className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <legend className="type-body-sm-medium text-fg-heading">Reference ranges</legend>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(newReferenceRange())}
          className="gap-1.5 bg-card type-caption-semibold font-sans text-fg-heading"
        >
          <PlusIcon data-icon="inline-start" />
          Add range
        </Button>
      </div>
      <FieldError errors={[errors.references?.root ?? errors.references]} />
      <ol className="flex flex-col gap-3">
        {fields.map((range, index) => {
          const rangeErrors = errors.references?.[index];
          const id = (name: string) => `range-${index}-${name}`;
          return (
            <li
              key={range.id}
              aria-label={`Reference range ${index + 1}`}
              className="flex flex-col gap-4 rounded-lg border bg-surface p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="type-caption-semibold text-fg-caption">Range {index + 1}</p>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove range ${index + 1}`}
                    onClick={() => remove(index)}
                    className="text-error-500 hover:bg-error-100 hover:text-error-700"
                  >
                    <TrashIcon />
                  </Button>
                )}
              </div>
              <div className="grid gap-x-4 gap-y-4 sm:grid-cols-3">
                <Controller
                  name={`references.${index}.age`}
                  control={form.control}
                  render={({ field }) => (
                    <SelectField
                      id={id("age")}
                      label="Age"
                      value={field.value}
                      options={ageGroupLabels}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  name={`references.${index}.gender`}
                  control={form.control}
                  render={({ field }) => (
                    <SelectField
                      id={id("gender")}
                      label="Sex"
                      value={field.value}
                      options={referenceGenderLabels}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  name={`references.${index}.pregnancy`}
                  control={form.control}
                  render={({ field }) => (
                    <SelectField
                      id={id("pregnancy")}
                      label="Pregnancy"
                      value={field.value}
                      options={pregnancyLabels}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                {(["min", "max"] as const).map((bound) => (
                  <Field key={bound} data-invalid={!!rangeErrors?.[bound]}>
                    <FieldLabel htmlFor={id(bound)} className="gap-1">
                      {bound === "min" ? "Minimum" : "Maximum"} <RequiredMark />
                    </FieldLabel>
                    <Input
                      id={id(bound)}
                      inputMode="decimal"
                      placeholder={bound === "min" ? "e.g. 3.5" : "e.g. 5.5"}
                      aria-invalid={!!rangeErrors?.[bound]}
                      className="bg-card"
                      {...form.register(`references.${index}.${bound}`)}
                    />
                    <FieldError errors={[rangeErrors?.[bound]]} />
                  </Field>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
    </fieldset>
  );
}
