import { ArrowRightIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { bookingFacilitiesQuery } from "@/features/patient/api/appointments";
import {
  bookableStaffQuery,
  bookingOptionsQuery,
} from "@/features/patient/api/pending-appointments";

/**
 * Who to see, the department and what for are required only when there's something to choose
 * (checked on submit). TODO(api): off the mock server there are no staff, departments or reasons
 * to choose from yet.
 */
const detailsSchema = z.object({
  facilityId: z.string().min(1, "Choose where you’d like to be seen"),
  staffId: z.string(),
  department: z.string(),
  reason: z.string(),
  note: z.string().max(500, "Keep the note under 500 characters"),
});
type BookingFields = z.infer<typeof detailsSchema>;
/** The booking's details, with the facility's name to show once it's booked. */
export type BookingDetails = BookingFields & { facility: string };

const empty: BookingFields = { facilityId: "", staffId: "", department: "", reason: "", note: "" };

/** A choice that's required when there's anything to choose, and its message. */
const requiredChoices = [
  ["staffId", "Choose who you’d like to see"],
  ["department", "Choose a department"],
  ["reason", "Choose what the visit is for"],
] as const;

/** Booking, step 1 of 3: where, who, which department, what for, and a note for the doctor. */
export function BookingDetailsStep({
  defaultValues,
  onContinue,
}: {
  defaultValues: BookingDetails | null;
  onContinue: (details: BookingDetails) => void;
}) {
  const { data: facilityList, isError: facilitiesFailed } = useQuery(bookingFacilitiesQuery());
  const { data: options } = useQuery(bookingOptionsQuery());
  const form = useForm<BookingFields>({
    resolver: zodResolver(detailsSchema),
    defaultValues: defaultValues ?? empty,
  });
  const facilityId = useWatch({ control: form.control, name: "facilityId" });
  const { data: staffList, isFetching: staffLoading } = useQuery(bookableStaffQuery(facilityId));

  const facilities = Object.fromEntries((facilityList ?? []).map(({ id, name }) => [id, name]));
  const staff = Object.fromEntries(
    (staffList ?? []).map(({ id, name, specialty }) => [
      id,
      [name, specialty].filter(Boolean).join(" · "),
    ]),
  );
  const departments = Object.fromEntries((options?.departments ?? []).map((name) => [name, name]));
  const reasons = Object.fromEntries((options?.reasons ?? []).map((name) => [name, name]));
  const noStaff = !!facilityId && !staffLoading && Object.keys(staff).length === 0;
  const choices = { staffId: staff, department: departments, reason: reasons };

  function submit(values: BookingFields) {
    const missing = requiredChoices.filter(
      ([name]) => !values[name] && Object.keys(choices[name]).length > 0,
    );
    for (const [name, message] of missing) form.setError(name, { message }, { shouldFocus: true });
    if (missing.length === 0) {
      onContinue({ ...values, facility: facilities[values.facilityId] ?? "" });
    }
  }

  const choice = (
    name: "facilityId" | "staffId" | "department" | "reason",
    label: string,
    items: Record<string, string>,
    placeholder: string,
    hint?: string,
  ) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`booking-${name}`} className="gap-1">
            {label} <RequiredMark />
          </FieldLabel>
          <Select
            name={field.name}
            items={items}
            value={field.value || null}
            onValueChange={(value) => {
              field.onChange(value ?? "");
              // Who to see depends on where.
              if (name === "facilityId") form.setValue("staffId", "");
            }}
            required
          >
            <SelectTrigger
              id={`booking-${name}`}
              aria-invalid={fieldState.invalid}
              onBlur={field.onBlur}
              className="w-full bg-card"
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(items).map(([value, text]) => (
                <SelectItem key={value} value={value}>
                  {text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hint && (
            <FieldDescription className="type-caption text-fg-caption">{hint}</FieldDescription>
          )}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );

  return (
    <>
      <FormDialogHeader
        title="Book appointment"
        description="Fill in your appointment details to book."
        progress={{ step: 1, total: 3 }}
      />
      <form
        onSubmit={form.handleSubmit(submit)}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <FormDialogBody>
          {choice(
            "facilityId",
            "Where would you like to be seen?",
            facilities,
            facilitiesFailed ? "Couldn’t load the facilities" : "Select facility",
          )}
          {choice(
            "staffId",
            "Who would you like to see?",
            staff,
            facilityId ? (staffLoading ? "Loading…" : "Select") : "Choose a facility first",
            noStaff
              ? "Choosing who to see isn’t available yet, so this facility can’t be booked here."
              : undefined,
          )}
          {Object.keys(departments).length > 0 &&
            choice("department", "Department", departments, "Select")}
          {Object.keys(reasons).length > 0 &&
            choice("reason", "What’s the visit for?", reasons, "Select")}
          <Field data-invalid={!!form.formState.errors.note}>
            <FieldLabel htmlFor="booking-note">Note</FieldLabel>
            <Textarea
              id="booking-note"
              placeholder="Anything your doctor should know?"
              aria-invalid={!!form.formState.errors.note}
              className="min-h-24 bg-card"
              {...form.register("note")}
            />
            <FieldError errors={[form.formState.errors.note]} />
          </Field>
        </FormDialogBody>
        <FormDialogFooter>
          <Button type="submit" className="h-11 px-5 type-heading-sm">
            Continue
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </FormDialogFooter>
      </form>
    </>
  );
}
