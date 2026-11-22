import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useFieldArray, useForm, type UseFormReturn, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { drugSearchQuery, useOrderDrugs, type VisitRef } from "@/features/doctor/api/orders";
import {
  durationRateLabels,
  emptyDrugRow,
  frequencyLabels,
  type PrescriptionInput,
  type PrescriptionValues,
  prescriptionSchema,
} from "@/features/doctor/lib/schemas";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/api";

type Form = UseFormReturn<PrescriptionInput, unknown, PrescriptionValues>;

/** Prescribe drugs for the pharmacy to dispense: one row per drug, then any allergies. */
export function PrescribeDialog({
  open,
  onOpenChange,
  visit,
  hin,
  patientName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit: VisitRef;
  hin: string;
  patientName: string;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <PrescribeForm
          visit={visit}
          hin={hin}
          patientName={patientName}
          onDone={() => onOpenChange(false)}
        />
      )}
    </FormDialog>
  );
}

function PrescribeForm({
  visit,
  hin,
  patientName,
  onDone,
}: {
  visit: VisitRef;
  hin: string;
  patientName: string;
  onDone: () => void;
}) {
  const prescribe = useOrderDrugs();
  const form: Form = useForm<PrescriptionInput, unknown, PrescriptionValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: { drugs: [emptyDrugRow], allergies: "" },
  });
  const rows = useFieldArray({ control: form.control, name: "drugs" });
  const { errors } = form.formState;

  function onSubmit({ drugs, allergies }: PrescriptionValues) {
    prescribe.mutate(
      {
        visit,
        hin,
        drugs: drugs.map((drug) => ({
          code: drug.code || null,
          name: drug.name,
          strength: drug.strength,
          form: drug.form,
          route: drug.route,
          quantity: Number(drug.quantity),
          unit: drug.unit,
          frequency: drug.frequency,
          duration: { value: Number(drug.durationValue), rate: drug.durationRate },
        })),
        allergies: allergies
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      },
      {
        onSuccess: () => {
          toast.success(`The prescription for ${patientName} is sent to the pharmacy.`);
          onDone();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader title="Prescribe" description={`Drugs for ${patientName}.`} />
      <FormDialogBody>
        {rows.fields.map((row, index) => (
          <DrugRow
            key={row.id}
            form={form}
            index={index}
            errors={errors.drugs?.[index]}
            onRemove={rows.fields.length > 1 ? () => rows.remove(index) : undefined}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => rows.append(emptyDrugRow)}
          className="gap-2 self-start bg-card type-body-sm-medium"
        >
          <PlusIcon data-icon="inline-start" />
          Add another drug
        </Button>

        <Field data-invalid={!!errors.allergies}>
          <FieldLabel htmlFor="prescriptionAllergies">Allergies</FieldLabel>
          <Textarea
            id="prescriptionAllergies"
            placeholder="One per line, e.g. Penicillin"
            aria-invalid={!!errors.allergies}
            className="min-h-16 bg-card"
            {...form.register("allergies")}
          />
          <FieldError errors={[errors.allergies]} />
        </Field>
      </FormDialogBody>
      <FormDialogFooter>
        <Button type="submit" loading={prescribe.isPending} className="h-11 px-5 type-heading-sm">
          Send to pharmacy
        </Button>
      </FormDialogFooter>
    </form>
  );
}

function DrugRow({
  form,
  index,
  errors,
  onRemove,
}: {
  form: Form;
  index: number;
  errors: NonNullable<Form["formState"]["errors"]["drugs"]>[number];
  onRemove?: () => void;
}) {
  const id = (field: string) => `drug-${index}-${field}`;
  const fromCatalogue = useWatch({ control: form.control, name: `drugs.${index}.code` }) !== "";

  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <legend className="type-body-sm-medium text-fg-heading">Drug {index + 1}</legend>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove drug ${index + 1}`}
            onClick={onRemove}
            className="text-fg-caption hover:bg-error-100 hover:text-error-500"
          >
            <TrashIcon className="size-4" />
          </Button>
        )}
      </div>

      <DrugSearch form={form} index={index} error={errors?.name?.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors?.quantity}>
          <FieldLabel htmlFor={id("quantity")} className="gap-1">
            Dose <RequiredMark />
          </FieldLabel>
          <Input
            id={id("quantity")}
            inputMode="decimal"
            placeholder="500"
            aria-invalid={!!errors?.quantity}
            className="bg-card"
            {...form.register(`drugs.${index}.quantity`)}
          />
          <FieldError errors={[errors?.quantity]} />
        </Field>
        <Field data-invalid={!!errors?.unit}>
          <FieldLabel htmlFor={id("unit")} className="gap-1">
            Unit <RequiredMark />
          </FieldLabel>
          <Input
            id={id("unit")}
            placeholder="mg"
            aria-invalid={!!errors?.unit}
            className="bg-card"
            {...form.register(`drugs.${index}.unit`)}
          />
          <FieldError errors={[errors?.unit]} />
        </Field>
        <Field data-invalid={!!errors?.route}>
          <FieldLabel htmlFor={id("route")} className="gap-1">
            Route <RequiredMark />
          </FieldLabel>
          <Input
            id={id("route")}
            placeholder="Oral"
            readOnly={fromCatalogue}
            aria-invalid={!!errors?.route}
            className="bg-card read-only:bg-line"
            {...form.register(`drugs.${index}.route`)}
          />
          <FieldError errors={[errors?.route]} />
        </Field>
        <Controller
          name={`drugs.${index}.frequency`}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={id("frequency")} className="gap-1">
                How often <RequiredMark />
              </FieldLabel>
              <Select
                items={frequencyLabels}
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <SelectTrigger
                  id={id("frequency")}
                  aria-invalid={fieldState.invalid}
                  className="w-full bg-card"
                >
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(frequencyLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Field data-invalid={!!errors?.durationValue}>
          <FieldLabel htmlFor={id("duration")} className="gap-1">
            For how long <RequiredMark />
          </FieldLabel>
          <div className="flex gap-2">
            <Input
              id={id("duration")}
              inputMode="numeric"
              placeholder="5"
              aria-invalid={!!errors?.durationValue}
              className="w-24 bg-card"
              {...form.register(`drugs.${index}.durationValue`)}
            />
            <Controller
              name={`drugs.${index}.durationRate`}
              control={form.control}
              render={({ field }) => (
                <Select
                  items={durationRateLabels}
                  value={field.value}
                  onValueChange={(value) => value && field.onChange(value)}
                >
                  <SelectTrigger aria-label="Duration unit" className="flex-1 bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(durationRateLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <FieldError errors={[errors?.durationValue]} />
        </Field>
      </div>
    </fieldset>
  );
}

/**
 * The drug's name: search the catalogue and pick one (which fills its strength, form and route),
 * or type a drug that isn't in it.
 */
function DrugSearch({ form, index, error }: { form: Form; index: number; error?: string }) {
  const name = useWatch({ control: form.control, name: `drugs.${index}.name` }) ?? "";
  const [code, strength, doseForm] = useWatch({
    control: form.control,
    name: [`drugs.${index}.code`, `drugs.${index}.strength`, `drugs.${index}.form`],
  });
  const detail = [strength, doseForm].filter(Boolean).join(" ");
  const [open, setOpen] = useState(false);
  const term = useDebouncedValue(name.trim());
  const { data: suggestions } = useQuery({
    ...drugSearchQuery(term),
    enabled: open && term.length >= 2,
  });
  const id = `drug-${index}-name`;

  return (
    <Field data-invalid={!!error} className="relative">
      <FieldLabel htmlFor={id} className="gap-1">
        Drug <RequiredMark />
      </FieldLabel>
      <Input
        id={id}
        autoComplete="off"
        placeholder="Search, e.g. Amoxicillin"
        aria-invalid={!!error}
        className="bg-card"
        {...form.register(`drugs.${index}.name`, {
          // Typing again leaves the catalogue drug for a typed one.
          onChange: () => {
            form.setValue(`drugs.${index}.code`, "");
            setOpen(true);
          },
          onBlur: () => setTimeout(() => setOpen(false), 150),
        })}
      />
      {open && suggestions && suggestions.length > 0 && (
        <ul
          aria-label="Matching drugs"
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-md border bg-card shadow-md"
        >
          {suggestions.map((drug) => (
            <li key={drug.code}>
              <button
                type="button"
                // Before the input's blur closes the list.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  form.setValue(`drugs.${index}.name`, drug.name);
                  form.setValue(`drugs.${index}.code`, drug.code);
                  form.setValue(`drugs.${index}.strength`, drug.strength ?? "");
                  form.setValue(`drugs.${index}.form`, drug.form ?? "");
                  if (drug.route) form.setValue(`drugs.${index}.route`, drug.route);
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-left type-body-sm-regular hover:bg-line"
              >
                {drug.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <FieldDescription>
        {code
          ? `From the catalogue${detail ? `: ${detail}` : ""}.`
          : "Not in the list? Type its name; it goes as written."}
      </FieldDescription>
      <FieldError errors={[error ? { message: error } : undefined]} />
    </Field>
  );
}
