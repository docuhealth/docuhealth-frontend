import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import {
  Controller,
  type FieldError as FormFieldError,
  type FieldPath,
  useForm,
  type UseFormReturn,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCareTask } from "@/features/doctor/api/care-tasks";
import { DrugPicker } from "@/features/doctor/components/drug-picker";
import {
  additiveLabels,
  bagVolumes,
  type CareTaskInput,
  type CareTaskValues,
  careTaskSchema,
  creatableTaskTypes,
  emptyCareTask,
  glucoseScheduleLabels,
  seizureTypeLabels,
  solutionLabels,
  standingOrderLabels,
  taskDurationRateLabels,
  trackingModeLabels,
} from "@/features/doctor/lib/care-task-schema";
import { frequencyLabels } from "@/features/doctor/lib/schemas";
import { getErrorMessage } from "@/lib/api";
import { careTaskTypeLabels, priorityLabels, vitalParameterLabels } from "@/lib/care-tasks";

type Form = UseFormReturn<CareTaskInput, unknown, CareTaskValues>;
type Name = FieldPath<CareTaskInput>;

const typeOptions = Object.fromEntries(
  creatableTaskTypes.map((type) => [type, careTaskTypeLabels[type]]),
) as Record<(typeof creatableTaskTypes)[number], string>;
const bagOptions = Object.fromEntries(bagVolumes.map((ml) => [ml, `${ml} ml`]));

/**
 * Set a care task for an admitted patient: what it is, when it starts, how often, until when,
 * how urgent, and each type's own details. The nurses see its first occurrences at once.
 */
export function CareTaskDialog({
  open,
  onOpenChange,
  admissionId,
  patientName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admissionId: string;
  patientName: string;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <CareTaskForm
          admissionId={admissionId}
          patientName={patientName}
          onDone={() => onOpenChange(false)}
        />
      )}
    </FormDialog>
  );
}

function CareTaskForm({
  admissionId,
  patientName,
  onDone,
}: {
  admissionId: string;
  patientName: string;
  onDone: () => void;
}) {
  const create = useCreateCareTask(admissionId);
  const form: Form = useForm<CareTaskInput, unknown, CareTaskValues>({
    resolver: zodResolver(careTaskSchema),
    defaultValues: emptyCareTask(),
  });
  const { errors } = form.formState;
  const [type, repeatUntil] = useWatch({ control: form.control, name: ["type", "repeatUntil"] });

  function onSubmit(task: CareTaskValues) {
    create.mutate(task, {
      onSuccess: () => {
        toast.success(
          `The ${careTaskTypeLabels[task.type].toLowerCase()} task is set for ${patientName}.`,
        );
        onDone();
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogHeader
        title="New care task"
        description={`A task for the nurses caring for ${patientName}.`}
      />
      <FormDialogBody>
        <SelectField
          form={form}
          name="type"
          label="Task"
          options={typeOptions}
          required
          error={errors.type}
        />

        {type && (
          <>
            <TypeDetails form={form} type={type} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.start}>
                <FieldLabel htmlFor="task-start" className="gap-1">
                  Starts <RequiredMark />
                </FieldLabel>
                <Input
                  id="task-start"
                  type="datetime-local"
                  aria-invalid={!!errors.start}
                  className="bg-card"
                  {...form.register("start")}
                />
                <FieldError errors={[errors.start]} />
              </Field>
              <SelectField
                form={form}
                name="frequency"
                label="How often"
                options={frequencyLabels}
                required
                error={errors.frequency}
              />
            </div>

            <Controller
              name="repeatUntil"
              control={form.control}
              render={({ field }) => (
                <FieldSet>
                  <FieldLegend variant="label">Runs</FieldLegend>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-wrap gap-5"
                  >
                    <Field orientation="horizontal" className="w-auto">
                      <RadioGroupItem value="discharge" id="task-until-discharge" />
                      <FieldLabel htmlFor="task-until-discharge" className="font-normal">
                        Until discharge
                      </FieldLabel>
                    </Field>
                    <Field orientation="horizontal" className="w-auto">
                      <RadioGroupItem value="duration" id="task-until-duration" />
                      <FieldLabel htmlFor="task-until-duration" className="font-normal">
                        For a set time
                      </FieldLabel>
                    </Field>
                  </RadioGroup>
                </FieldSet>
              )}
            />
            {repeatUntil === "duration" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  form={form}
                  name="durationValue"
                  label="For how long"
                  inputMode="numeric"
                  placeholder="3"
                  required
                  error={errors.durationValue}
                />
                <SelectField
                  form={form}
                  name="durationRate"
                  label="Unit"
                  options={taskDurationRateLabels}
                />
              </div>
            )}

            <SelectField form={form} name="priority" label="Priority" options={priorityLabels} />
            <Field data-invalid={!!errors.instructions}>
              <FieldLabel htmlFor="task-instructions">Instructions</FieldLabel>
              <Textarea
                id="task-instructions"
                placeholder="Anything the nurses should know"
                aria-invalid={!!errors.instructions}
                className="min-h-20 bg-card"
                {...form.register("instructions")}
              />
              <FieldError errors={[errors.instructions]} />
            </Field>
          </>
        )}
      </FormDialogBody>
      <FormDialogFooter>
        <Button type="submit" loading={create.isPending} className="h-11 px-5 type-heading-sm">
          Set task
        </Button>
      </FormDialogFooter>
    </form>
  );
}

/** The chosen task type's own details. */
function TypeDetails({ form, type }: { form: Form; type: string }) {
  const { errors } = form.formState;
  switch (type) {
    case "vital_signs":
      return (
        <Controller
          name="parameters"
          control={form.control}
          render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid}>
              <FieldLegend variant="label" className="flex gap-1">
                Vital signs to take <RequiredMark />
              </FieldLegend>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(vitalParameterLabels).map(([value, label]) => {
                  const id = `task-param-${value}`;
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
                              : field.value.filter((item) => item !== value),
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
              <FieldError errors={[fieldState.error]} />
            </FieldSet>
          )}
        />
      );
    case "medication":
      return <MedicationDetails form={form} />;
    case "input_output":
      return (
        <SelectField
          form={form}
          name="trackingMode"
          label="Track"
          options={trackingModeLabels}
          required
          error={errors.trackingMode}
        />
      );
    case "procedure":
      return (
        <TextField
          form={form}
          name="procedureName"
          label="Procedure"
          placeholder="e.g. Wound dressing"
          required
          error={errors.procedureName}
        />
      );
    case "glucose":
      return (
        <SelectField
          form={form}
          name="glucoseSchedule"
          label="Schedule"
          options={glucoseScheduleLabels}
          required
          error={errors.glucoseSchedule}
        />
      );
    case "iv_fluid":
      return (
        <>
          <SelectField
            form={form}
            name="solution"
            label="Solution"
            options={solutionLabels}
            required
            error={errors.solution}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              form={form}
              name="bagVolume"
              label="Bag size"
              options={bagOptions}
              required
              error={errors.bagVolume}
            />
            <TextField
              form={form}
              name="totalPlan"
              label="Total (ml)"
              inputMode="numeric"
              placeholder="2000"
              required
              error={errors.totalPlan}
            />
            <TextField
              form={form}
              name="infusionRate"
              label="Rate (ml/hour)"
              inputMode="numeric"
              placeholder="125"
              required
              error={errors.infusionRate}
            />
          </div>
          <Controller
            name="additives"
            control={form.control}
            render={({ field }) => (
              <FieldSet>
                <FieldLegend variant="label">Additives</FieldLegend>
                <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-3">
                  {Object.entries(additiveLabels).map(([value, label]) => {
                    const id = `task-additive-${value}`;
                    return (
                      <Field key={value} orientation="horizontal">
                        <Checkbox
                          id={id}
                          checked={field.value.includes(value)}
                          onCheckedChange={(next) =>
                            field.onChange(
                              next
                                ? [...field.value, value]
                                : field.value.filter((item) => item !== value),
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
        </>
      );
    case "seizure_event":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            form={form}
            name="seizureType"
            label="Seizure type"
            options={seizureTypeLabels}
            required
            error={errors.seizureType}
          />
          <SelectField
            form={form}
            name="standingOrder"
            label="Standing order"
            options={standingOrderLabels}
            required
            error={errors.standingOrder}
          />
        </div>
      );
    default:
      return null;
  }
}

/** The drug to give: from the catalogue or typed, with its dose (given as often as the task). */
function MedicationDetails({ form }: { form: Form }) {
  const { errors } = form.formState;
  const [name, code] = useWatch({ control: form.control, name: ["drugName", "drugCode"] });
  return (
    <>
      <Field data-invalid={!!errors.drugName}>
        <FieldLabel htmlFor="task-drug" className="gap-1">
          Drug <RequiredMark />
        </FieldLabel>
        <DrugPicker
          id="task-drug"
          value={name}
          invalid={!!errors.drugName}
          onType={(typed) => {
            form.setValue("drugName", typed);
            form.setValue("drugCode", "");
          }}
          onPick={(drug) => {
            form.setValue("drugName", drug.label);
            form.setValue("drugCode", drug.code);
            if (drug.route) form.setValue("drugRoute", drug.route);
          }}
        />
        <FieldDescription>
          {code ? "From the catalogue." : "Not in the list? Type its name; it goes as written."}
        </FieldDescription>
        <FieldError errors={[errors.drugName]} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          form={form}
          name="drugQuantity"
          label="Dose"
          inputMode="decimal"
          placeholder="1"
          required
          error={errors.drugQuantity}
        />
        <TextField
          form={form}
          name="drugUnit"
          label="Unit"
          placeholder="g"
          required
          error={errors.drugUnit}
        />
        <TextField
          form={form}
          name="drugRoute"
          label="Route"
          placeholder="IV"
          required
          error={errors.drugRoute}
          readOnly={!!code}
        />
      </div>
    </>
  );
}

function TextField({
  form,
  name,
  label,
  required,
  error,
  ...input
}: {
  form: Form;
  name: Name;
  label: string;
  required?: boolean;
  error?: FormFieldError;
} & Pick<React.ComponentProps<"input">, "placeholder" | "inputMode" | "readOnly">) {
  const id = `task-${name}`;
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id} className="gap-1">
        {label} {required && <RequiredMark />}
      </FieldLabel>
      <Input
        id={id}
        aria-invalid={!!error}
        className="bg-card read-only:bg-line"
        {...input}
        {...form.register(name)}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}

function SelectField({
  form,
  name,
  label,
  options,
  required,
  error,
}: {
  form: Form;
  name: Name;
  label: ReactNode;
  options: Record<string, string>;
  required?: boolean;
  error?: FormFieldError;
}) {
  const id = `task-${name}`;
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor={id} className="gap-1">
            {label} {required && <RequiredMark />}
          </FieldLabel>
          <Select
            items={options}
            value={(field.value as string) || null}
            onValueChange={(value) => field.onChange(value ?? "")}
          >
            <SelectTrigger id={id} aria-invalid={!!error} className="w-full bg-card">
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(options).map(([value, text]) => (
                <SelectItem key={value} value={value}>
                  {text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[error]} />
        </Field>
      )}
    />
  );
}
