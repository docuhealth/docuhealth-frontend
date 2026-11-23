import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAssignAppointment } from "@/features/staff/api/mutations";
import { doctorsQuery } from "@/features/staff/api/queries";
import type { Appointment } from "@/features/staff/api/schemas";
import {
  type AssignAppointmentValues,
  assignAppointmentSchema,
} from "@/features/staff/lib/schemas";
import { getErrorMessage } from "@/lib/api";

const pad = (n: number) => String(n).padStart(2, "0");

/** Give a booked appointment to a doctor, at its time or another. */
export function AssignAppointmentDialog({
  appointment,
  onClose,
}: {
  appointment: Appointment | null;
  onClose: () => void;
}) {
  return (
    <FormDialog open={!!appointment} onOpenChange={(open) => !open && onClose()}>
      {appointment && <AssignForm appointment={appointment} onDone={onClose} />}
    </FormDialog>
  );
}

function AssignForm({ appointment, onDone }: { appointment: Appointment; onDone: () => void }) {
  const { data: doctors } = useQuery(doctorsQuery());
  const assign = useAssignAppointment();
  // When the form opened: no day before today can be picked.
  const [today] = useState(() => new Date());
  const at = new Date(appointment.at);
  const form = useForm<AssignAppointmentValues>({
    resolver: zodResolver(assignAppointmentSchema),
    defaultValues: {
      doctor: "",
      date: `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`,
      time: `${pad(at.getHours())}:${pad(at.getMinutes())}`,
      note: appointment.note ?? "",
    },
  });
  const { errors } = form.formState;
  const options = Object.fromEntries((doctors ?? []).map(({ id, name }) => [id, name]));

  function onSubmit({ doctor, date, time, note }: AssignAppointmentValues) {
    assign.mutate(
      {
        id: appointment.id,
        doctorId: doctor,
        at: new Date(`${date}T${time}`),
        // TODO(api): the type isn't documented; v1 only ever sent `consultation`.
        type: appointment.typeCode ?? "consultation",
        note,
      },
      {
        onSuccess: () => {
          toast.success(
            `${appointment.patient.name}’s appointment is with ${options[doctor] ?? "the doctor"}.`,
          );
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
      <FormDialogHeader
        title="Assign to a doctor"
        description={`Who ${appointment.patient.name} sees, and when.`}
      />
      <FormDialogBody>
        <Controller
          name="doctor"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="assign-doctor" className="gap-1">
                Doctor <RequiredMark />
              </FieldLabel>
              <Select
                items={options}
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <SelectTrigger
                  id="assign-doctor"
                  aria-invalid={fieldState.invalid}
                  className="w-full bg-card"
                >
                  <SelectValue placeholder={doctors ? "Choose a doctor" : "Loading…"} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(options).map(([value, label]) => (
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
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <Controller
            name="date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="assign-date" className="gap-1">
                  Date <RequiredMark />
                </FieldLabel>
                <DateInput
                  id="assign-date"
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
          <Field data-invalid={!!errors.time}>
            <FieldLabel htmlFor="assign-time" className="gap-1">
              Time <RequiredMark />
            </FieldLabel>
            <Input
              id="assign-time"
              type="time"
              aria-invalid={!!errors.time}
              className="bg-card"
              {...form.register("time")}
            />
            <FieldError errors={[errors.time]} />
          </Field>
        </div>
        <Field data-invalid={!!errors.note}>
          <FieldLabel htmlFor="assign-note">Note</FieldLabel>
          <Textarea
            id="assign-note"
            placeholder="e.g. Review of blood pressure"
            aria-invalid={!!errors.note}
            className="min-h-20 bg-card"
            {...form.register("note")}
          />
          <FieldError errors={[errors.note]} />
        </Field>
      </FormDialogBody>
      <FormDialogFooter>
        <Button type="submit" loading={assign.isPending} className="h-11 px-5 type-heading-sm">
          Assign
        </Button>
      </FormDialogFooter>
    </form>
  );
}
