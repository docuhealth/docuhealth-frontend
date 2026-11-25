import { zodResolver } from "@hookform/resolvers/zod";
import { CaretRightIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { DateInput } from "@/components/date-input";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { type Dependant, type Gender, useAddDependant } from "@/features/patient/api/family";
import { FamilyDoneStep } from "@/features/patient/components/family-done-step";
import { DEPENDANT_RELATIONSHIPS, GENDERS } from "@/features/patient/lib/family";
import { getErrorMessage } from "@/lib/api";
import { ADULT_AGE, ageOn } from "@/lib/format";

const schema = z.object({
  firstName: z.string().trim().min(1, "Enter the child’s first name"),
  lastName: z.string().trim().min(1, "Enter the child’s last name"),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a date as DD/MM/YYYY")
    .refine((dob) => new Date(dob) <= new Date(), "That date hasn’t come yet")
    .refine((dob) => ageOn(new Date(dob)) < ADULT_AGE, `A dependent is under ${ADULT_AGE}`),
  gender: z.string().min(1, "Select a gender"),
  relationship: z.string().min(1, "Select how you’re related"),
  isPrimaryContact: z.boolean(),
  canConsent: z.boolean(),
});
type Values = z.infer<typeof schema>;

/** "Add a Dependent": the child's details, then "Dependent registered!" with their new HIN. */
export function AddDependantDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {/* Remounts on each open, so it starts fresh. */}
      {open && <AddDependantSteps />}
    </FormDialog>
  );
}

function AddDependantSteps() {
  const add = useAddDependant();
  const [added, setAdded] = useState<Dependant | null>(null);
  const [today] = useState(() => new Date());
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dob: "",
      gender: "",
      relationship: "",
      isPrimaryContact: true,
      canConsent: false,
    },
  });
  const { errors } = form.formState;

  if (added) {
    return (
      <FamilyDoneStep
        title="Dependent registered!"
        description={`${added.name} is linked to your account. You can sign in to manage their care.`}
      >
        <div className="flex flex-col gap-1 rounded-lg border bg-surface px-4 py-3">
          <p className="type-body-sm-medium text-fg-heading">Child’s HIN: {added.hin}</p>
          <p className="type-caption text-fg-caption">
            Write down the child’s HIN and keep it safe. You’ll need it at check-in.
          </p>
        </div>
      </FamilyDoneStep>
    );
  }

  const submit = (values: Values) =>
    add.mutate(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        dob: values.dob,
        gender: values.gender as Gender,
        relationship: values.relationship,
        isPrimaryContact: values.isPrimaryContact,
        canConsent: values.canConsent,
      },
      { onSuccess: setAdded, onError: (error) => toast.error(getErrorMessage(error)) },
    );

  const choice = (
    name: "gender" | "relationship",
    label: string,
    items: Record<string, string>,
  ) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`dependant-${name}`} className="gap-1">
            {label} <RequiredMark />
          </FieldLabel>
          <Select
            name={field.name}
            items={items}
            value={field.value || null}
            onValueChange={(value) => field.onChange(value ?? "")}
          >
            <SelectTrigger
              id={`dependant-${name}`}
              aria-required
              aria-invalid={fieldState.invalid}
              onBlur={field.onBlur}
              className="w-full bg-card"
            >
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(items).map(([value, text]) => (
                <SelectItem key={value} value={value}>
                  {text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );

  return (
    <form onSubmit={form.handleSubmit(submit)} noValidate className="flex min-h-0 flex-1 flex-col">
      <FormDialogHeader
        title="Add a Dependent"
        description="Add a child under 18 so you can manage their care."
      />
      <FormDialogBody className="gap-5">
        {(
          [
            ["firstName", "First Name", "E.g. John"],
            ["lastName", "Last Name", "E.g. Doe"],
          ] as const
        ).map(([name, label, placeholder]) => (
          <Field key={name} data-invalid={!!errors[name]}>
            <FieldLabel htmlFor={`dependant-${name}`} className="gap-1">
              {label} <RequiredMark />
            </FieldLabel>
            <Input
              id={`dependant-${name}`}
              autoComplete="off"
              placeholder={placeholder}
              aria-required
              aria-invalid={!!errors[name]}
              className="h-11 bg-card"
              {...form.register(name)}
            />
            <FieldError errors={[errors[name]]} />
          </Field>
        ))}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Controller
            name="dob"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="dependant-dob" className="gap-1">
                  Date of Birth <RequiredMark />
                </FieldLabel>
                <DateInput
                  ref={field.ref}
                  id="dependant-dob"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  max={today}
                  invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          {choice("gender", "Gender", GENDERS as Record<string, string>)}
        </div>

        {choice("relationship", "Relationship to child", DEPENDANT_RELATIONSHIPS)}

        <div className="flex flex-col gap-3">
          {(
            [
              ["isPrimaryContact", "Set as Primary contact"],
              ["canConsent", "Can consent to treatment"],
            ] as const
          ).map(([name, label]) => (
            <Controller
              key={name}
              name={name}
              control={form.control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-3 type-body-sm-regular text-fg-heading">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                  {label}
                </label>
              )}
            />
          ))}
        </div>
      </FormDialogBody>
      <FormDialogFooter>
        <Button
          type="submit"
          loading={add.isPending}
          className="h-11 gap-2 px-5 type-heading-sm has-data-[icon=inline-end]:pr-4"
        >
          Add a Child
          <CaretRightIcon data-icon="inline-end" />
        </Button>
      </FormDialogFooter>
    </form>
  );
}
