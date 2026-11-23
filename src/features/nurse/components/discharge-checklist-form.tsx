import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { VitalsFields } from "@/components/dashboard/vitals-fields";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type TaskOccurrence, useRecordTask } from "@/features/nurse/api/tasks";
import {
  type DischargeChecklistValues,
  dischargeChecklistSchema,
  dischargeChecks,
  dischargeChoices,
} from "@/features/nurse/lib/schemas";
import { getErrorMessage } from "@/lib/api";
import { emptyVitals, toVitalSignsWrite } from "@/lib/vitals-form";

const radios = ["condition_on_discharge", "accompanied_by", "mobility_status"] as const;
const selects = ["iv_sites_status", "wound_status"] as const;

/**
 * The nurse's discharge checklist (the `nurse_in_patient_discharge` task), once the doctor has
 * written the discharge summary: final vitals, what's been done, the patient's state on leaving,
 * and what they were taught. It discharges the patient and frees the bed.
 */
export function DischargeChecklistForm({
  task,
  admissionId,
  onDone,
}: {
  task: TaskOccurrence;
  admissionId: string;
  onDone: () => void;
}) {
  const record = useRecordTask();
  const queryClient = useQueryClient();
  const form = useForm<DischargeChecklistValues>({
    resolver: zodResolver(dischargeChecklistSchema),
    defaultValues: {
      vitals: emptyVitals,
      checks: [],
      condition_on_discharge: "stable",
      accompanied_by: "relative",
      mobility_status: "mobile",
      iv_sites_status: "clean_intact_dry",
      wound_status: "na_no_wounds",
      education_given: "",
      follow_up_instructions: "",
    },
  });
  const { errors } = form.formState;

  function onSubmit({ vitals, checks, ...rest }: DischargeChecklistValues) {
    record.mutate(
      {
        id: task.id,
        record: {
          admission_id: admissionId,
          patient: task.patient.hin,
          final_vital_signs: toVitalSignsWrite(vitals),
          ...Object.fromEntries(
            Object.keys(dischargeChecks).map((check) => [check, checks.includes(check as never)]),
          ),
          ...rest,
        },
      },
      {
        onSuccess: () => {
          // The bed is free and the patient discharged: every list moves.
          void queryClient.invalidateQueries();
          toast.success(`${task.patient.name} is discharged.`);
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
          title="Discharge checklist"
          description={`${task.patient.name}’s final vitals and checks before they leave.`}
        />
        <FormDialogBody>
          <VitalsFields idPrefix="discharge-vitals" />

          <Controller
            name="checks"
            control={form.control}
            render={({ field }) => (
              <FieldSet>
                <FieldLegend variant="label">Done before leaving</FieldLegend>
                <div className="flex flex-col gap-3">
                  {Object.entries(dischargeChecks).map(([value, label]) => {
                    const id = `discharge-check-${value}`;
                    const checked = field.value.includes(value as never);
                    return (
                      <Field key={value} orientation="horizontal">
                        <Checkbox
                          id={id}
                          checked={checked}
                          onCheckedChange={(next) =>
                            field.onChange(
                              next
                                ? [...field.value, value]
                                : field.value.filter((one) => one !== value),
                            )
                          }
                        />
                        <FieldLabel htmlFor={id} className="font-normal">
                          {label}
                        </FieldLabel>
                      </Field>
                    );
                  })}
                </div>
              </FieldSet>
            )}
          />

          {radios.map((name) => (
            <Controller
              key={name}
              name={name}
              control={form.control}
              render={({ field }) => (
                <FieldSet>
                  <FieldLegend variant="label">{dischargeChoices[name].label}</FieldLegend>
                  <RadioGroup
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-wrap gap-x-5 gap-y-3"
                  >
                    {Object.entries(dischargeChoices[name].options).map(([value, label]) => (
                      <Field key={value} orientation="horizontal" className="w-auto">
                        <RadioGroupItem value={value} id={`discharge-${name}-${value}`} />
                        <FieldLabel htmlFor={`discharge-${name}-${value}`} className="font-normal">
                          {label}
                        </FieldLabel>
                      </Field>
                    ))}
                  </RadioGroup>
                </FieldSet>
              )}
            />
          ))}

          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            {selects.map((name) => {
              const { label, options } = dischargeChoices[name];
              return (
                <Controller
                  key={name}
                  name={name}
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor={`discharge-${name}`}>{label}</FieldLabel>
                      <Select
                        items={options}
                        value={field.value}
                        onValueChange={(value) => value && field.onChange(value)}
                      >
                        <SelectTrigger id={`discharge-${name}`} className="w-full bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(options).map(([value, text]) => (
                            <SelectItem key={value} value={value}>
                              {text}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
              );
            })}
          </div>

          {(
            [
              ["education_given", "Education given", "e.g. Wound care, when to take each drug"],
              [
                "follow_up_instructions",
                "Follow-up instructions",
                "e.g. Clinic on Monday at 10:00; come back if the fever returns",
              ],
            ] as const
          ).map(([name, label, placeholder]) => (
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
          ))}
        </FormDialogBody>
        <FormDialogFooter>
          <Button type="submit" loading={record.isPending} className="h-11 px-5 type-heading-sm">
            Discharge patient
          </Button>
        </FormDialogFooter>
      </form>
    </FormProvider>
  );
}
