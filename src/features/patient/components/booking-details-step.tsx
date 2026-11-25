import { ArrowRightIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { bookingOptionsQuery } from "@/features/patient/api/pending-appointments";

const detailsSchema = z.object({
  facilityId: z.string().min(1, "Choose where you’d like to be seen"),
  department: z.string().min(1, "Choose a department"),
  reason: z.string().min(1, "Choose what the visit is for"),
  note: z.string().max(500, "Keep the note under 500 characters"),
});
export type BookingDetails = z.infer<typeof detailsSchema>;

const empty: BookingDetails = { facilityId: "", department: "", reason: "", note: "" };

/** Booking, step 1 of 3: where, which department, what for, and a note for the doctor. */
export function BookingDetailsStep({
  defaultValues,
  onContinue,
}: {
  defaultValues: BookingDetails | null;
  onContinue: (details: BookingDetails) => void;
}) {
  const { data: options } = useQuery(bookingOptionsQuery());
  const form = useForm<BookingDetails>({
    resolver: zodResolver(detailsSchema),
    defaultValues: defaultValues ?? empty,
  });
  const facilities = Object.fromEntries(
    (options?.facilities ?? []).map((facility) => [
      facility.id,
      [facility.name, facility.area].filter(Boolean).join(", "),
    ]),
  );
  const departments = Object.fromEntries((options?.departments ?? []).map((name) => [name, name]));
  const reasons = Object.fromEntries((options?.reasons ?? []).map((name) => [name, name]));

  const choice = (
    name: "facilityId" | "department" | "reason",
    label: string,
    items: Record<string, string>,
    placeholder: string,
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
            onValueChange={(value) => field.onChange(value ?? "")}
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
        onSubmit={form.handleSubmit(onContinue)}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <FormDialogBody>
          {choice("facilityId", "Where would you like to be seen?", facilities, "Select facility")}
          {choice("department", "Department", departments, "Select")}
          {choice("reason", "What’s the visit for?", reasons, "Select")}
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
