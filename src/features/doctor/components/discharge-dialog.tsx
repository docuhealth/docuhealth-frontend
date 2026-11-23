import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, type Path, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { DateInput } from "@/components/date-input";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  dischargeInvestigationsQuery,
  type Investigation,
  useDischargeAdmission,
} from "@/features/doctor/api/discharge";
import { DrugRow, type DrugsForm } from "@/features/doctor/components/prescribe-dialog";
import {
  type DischargeInput,
  type DischargeValues,
  dischargeConditionLabels,
  dischargeSchema,
  dischargeSummaryFields,
  emptyDischarge,
  followUpLabels,
} from "@/features/doctor/lib/discharge-schema";
import { emptyDrugRow } from "@/features/doctor/lib/schemas";
import { getErrorMessage } from "@/lib/api";
import { formatDateCommaTime } from "@/lib/format";

/**
 * Discharge an admitted patient, in two steps: the stay's summary, then the condition at
 * discharge, care instructions, investigations, drugs to take home and the follow-up. The nurse
 * then completes the discharge checklist, which frees the bed.
 */
export function DischargeDialog({
  open,
  onOpenChange,
  admissionId,
  hin,
  patientName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admissionId: string;
  hin: string;
  patientName: string;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DischargeForm
          admissionId={admissionId}
          hin={hin}
          patientName={patientName}
          onDone={() => onOpenChange(false)}
        />
      )}
    </FormDialog>
  );
}

const summaryNames = dischargeSummaryFields.map(([name]) => name);

function DischargeForm({
  admissionId,
  hin,
  patientName,
  onDone,
}: {
  admissionId: string;
  hin: string;
  patientName: string;
  onDone: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  // When the form opened: a follow-up can't be booked before today.
  const [today] = useState(() => new Date());
  const discharge = useDischargeAdmission();
  const { data: investigations } = useQuery(dischargeInvestigationsQuery(hin));
  const form = useForm<DischargeInput, unknown, DischargeValues>({
    resolver: zodResolver(dischargeSchema),
    defaultValues: emptyDischarge,
  });
  const drugs = useFieldArray({ control: form.control, name: "drugs" });
  const followUp = useWatch({ control: form.control, name: "followUp.plan" });
  const { errors } = form.formState;
  // The drug rows are the prescription's; they only touch `drugs`.
  const drugsForm = form as unknown as DrugsForm;

  async function next() {
    if (await form.trigger(summaryNames)) setStep(2);
  }

  function onSubmit(values: DischargeValues) {
    discharge.mutate(
      { admissionId, hin, values },
      {
        onSuccess: () => {
          toast.success(
            `${patientName}’s discharge summary is saved. A nurse completes the discharge.`,
          );
          onDone();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <form
      onSubmit={
        step === 1
          ? (event) => {
              event.preventDefault();
              void next();
            }
          : form.handleSubmit(onSubmit)
      }
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader
        title="Discharge patient"
        description={
          step === 1
            ? `How ${patientName}’s stay went.`
            : `${patientName}’s condition, care at home and follow-up.`
        }
        progress={{ step, total: 2 }}
      />
      <FormDialogBody>
        {step === 1 ? (
          dischargeSummaryFields.map(([name, label, placeholder]) => (
            <Field key={name} data-invalid={!!errors[name]}>
              <FieldLabel htmlFor={`discharge-${name}`} className="gap-1">
                {label} <RequiredMark />
              </FieldLabel>
              <Textarea
                id={`discharge-${name}`}
                placeholder={placeholder}
                aria-required
                aria-invalid={!!errors[name]}
                className="min-h-16 bg-card"
                {...form.register(name)}
              />
              <FieldError errors={[errors[name]]} />
            </Field>
          ))
        ) : (
          <>
            <Controller
              name="condition"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend variant="label" className="flex gap-1">
                    Condition at discharge <RequiredMark />
                  </FieldLegend>
                  <RadioGroup
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    className="flex flex-wrap gap-x-5 gap-y-3"
                  >
                    {Object.entries(dischargeConditionLabels).map(([value, label]) => (
                      <Field key={value} orientation="horizontal" className="w-auto">
                        <RadioGroupItem value={value} id={`discharge-condition-${value}`} />
                        <FieldLabel
                          htmlFor={`discharge-condition-${value}`}
                          className="font-normal"
                        >
                          {label}
                        </FieldLabel>
                      </Field>
                    ))}
                  </RadioGroup>
                  <FieldError errors={[fieldState.error]} />
                </FieldSet>
              )}
            />

            <Field data-invalid={!!errors.careInstructions}>
              <FieldLabel htmlFor="discharge-careInstructions" className="gap-1">
                Care instructions <RequiredMark />
              </FieldLabel>
              <Textarea
                id="discharge-careInstructions"
                placeholder="e.g. Rest for a week; keep the wound dry"
                aria-required
                aria-invalid={!!errors.careInstructions}
                className="min-h-16 bg-card"
                {...form.register("careInstructions")}
              />
              <FieldError errors={[errors.careInstructions]} />
            </Field>

            <InvestigationPicker
              form={form}
              name="completed"
              legend="Completed investigations"
              empty="No lab test has a result yet."
              options={investigations?.completed}
            />
            <InvestigationPicker
              form={form}
              name="pending"
              legend="Pending investigations"
              empty="No lab test is waiting for a result."
              options={investigations?.pending}
            />

            <FieldSet>
              <FieldLegend variant="label">Drugs to take home</FieldLegend>
              {drugs.fields.map((row, index) => (
                <DrugRow
                  key={row.id}
                  form={drugsForm}
                  index={index}
                  errors={errors.drugs?.[index]}
                  onRemove={() => drugs.remove(index)}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => drugs.append(emptyDrugRow)}
                className="gap-2 self-start bg-card type-body-sm-medium"
              >
                <PlusIcon data-icon="inline-start" />
                Add a drug
              </Button>
            </FieldSet>

            <Controller
              name="followUp.plan"
              control={form.control}
              render={({ field }) => (
                <FieldSet>
                  <FieldLegend variant="label">Follow-up</FieldLegend>
                  <RadioGroup
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-wrap gap-x-5 gap-y-3"
                  >
                    {Object.entries(followUpLabels).map(([value, label]) => (
                      <Field key={value} orientation="horizontal" className="w-auto">
                        <RadioGroupItem value={value} id={`discharge-followUp-${value}`} />
                        <FieldLabel htmlFor={`discharge-followUp-${value}`} className="font-normal">
                          {label}
                        </FieldLabel>
                      </Field>
                    ))}
                  </RadioGroup>
                </FieldSet>
              )}
            />
            {followUp !== "none" && (
              <>
                {followUp === "elsewhere" && (
                  <Field data-invalid={!!errors.followUp?.clinic}>
                    <FieldLabel htmlFor="discharge-clinic" className="gap-1">
                      Clinic <RequiredMark />
                    </FieldLabel>
                    <Input
                      id="discharge-clinic"
                      placeholder="e.g. Ikeja Family Clinic"
                      aria-invalid={!!errors.followUp?.clinic}
                      className="bg-card"
                      {...form.register("followUp.clinic")}
                    />
                    <FieldError errors={[errors.followUp?.clinic]} />
                  </Field>
                )}
                <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                  <Controller
                    name="followUp.date"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="discharge-date" className="gap-1">
                          Date <RequiredMark />
                        </FieldLabel>
                        <DateInput
                          id="discharge-date"
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          min={today}
                          invalid={fieldState.invalid}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                  <Field data-invalid={!!errors.followUp?.time}>
                    <FieldLabel htmlFor="discharge-time" className="gap-1">
                      Time <RequiredMark />
                    </FieldLabel>
                    <Input
                      id="discharge-time"
                      type="time"
                      aria-invalid={!!errors.followUp?.time}
                      className="bg-card"
                      {...form.register("followUp.time")}
                    />
                    <FieldError errors={[errors.followUp?.time]} />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="discharge-instructions">Follow-up instructions</FieldLabel>
                  <Textarea
                    id="discharge-instructions"
                    placeholder="e.g. Bring the latest blood results"
                    className="min-h-16 bg-card"
                    {...form.register("followUp.instructions")}
                  />
                </Field>
              </>
            )}
          </>
        )}
      </FormDialogBody>
      <FormDialogFooter onBack={step === 2 ? () => setStep(1) : undefined}>
        <Button type="submit" loading={discharge.isPending} className="h-11 px-5 type-heading-sm">
          {step === 1 ? "Continue" : "Discharge patient"}
        </Button>
      </FormDialogFooter>
    </form>
  );
}

/** Tick the lab tests the summary lists. */
function InvestigationPicker({
  form,
  name,
  legend,
  empty,
  options,
}: {
  form: ReturnType<typeof useForm<DischargeInput, unknown, DischargeValues>>;
  name: Extract<Path<DischargeInput>, "completed" | "pending">;
  legend: string;
  empty: string;
  options: Investigation[] | undefined;
}) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <FieldSet>
          <FieldLegend variant="label">{legend}</FieldLegend>
          {!options ? (
            <p className="type-body-sm-regular text-fg-caption">Loading…</p>
          ) : options.length === 0 ? (
            <p className="type-body-sm-regular text-fg-caption">{empty}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {options.map(({ id, name: test, orderedAt }) => {
                const checkboxId = `discharge-${name}-${id}`;
                return (
                  <Field key={id} orientation="horizontal">
                    <Checkbox
                      id={checkboxId}
                      checked={field.value.includes(id)}
                      onCheckedChange={(next) =>
                        field.onChange(
                          next ? [...field.value, id] : field.value.filter((one) => one !== id),
                        )
                      }
                    />
                    <FieldLabel htmlFor={checkboxId} className="font-normal">
                      {test}
                      <span className="text-fg-caption">
                        {" "}
                        · ordered {formatDateCommaTime(new Date(orderedAt))}
                      </span>
                    </FieldLabel>
                  </Field>
                );
              })}
            </div>
          )}
        </FieldSet>
      )}
    />
  );
}
