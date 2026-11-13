import { CaretRightIcon } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { TimeInput } from "@/components/time-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useLogImagingTime } from "@/features/radiologist/api/mutations";
import type { ScanOrder } from "@/features/radiologist/api/schemas";
import { devPrefill } from "@/features/radiologist/lib/dev-prefill";
import { type ImagingTimeValues, imagingTimeSchema } from "@/features/radiologist/lib/schemas";
import { getErrorMessage } from "@/lib/api";
import { toIsoDate } from "@/lib/date-input";
import { formatDateDotTime } from "@/lib/format";

/**
 * "Imaging Info": when an accepted order's scan is booked for (or was taken). If a time is
 * already logged it opens as an edit ("Change imaging time"), on that time. `onSaved` runs once
 * it's stored, with `edited` saying which of the two it was.
 */
export function ImagingTimeDialog({
  order,
  open,
  onOpenChange,
  onSaved,
}: {
  order: ScanOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (result: { edited: boolean }) => void;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {/* Mounts with the dialog, so it starts from the order as it is now. */}
      <ImagingTimeForm order={order} onSaved={onSaved} />
    </FormDialog>
  );
}

function ImagingTimeForm({
  order,
  onSaved,
}: {
  order: ScanOrder;
  onSaved: (result: { edited: boolean }) => void;
}) {
  const logTime = useLogImagingTime(order.id);
  const [requestedAt] = useState(() => new Date(order.requestedAt));
  const [schema] = useState(() => imagingTimeSchema(requestedAt));
  // Read once on mount: saving updates the order, which mustn't flip this mid-save.
  const [logged] = useState(() => (order.scheduledAt ? new Date(order.scheduledAt) : null));

  const form = useForm<ImagingTimeValues>({
    resolver: zodResolver(schema),
    defaultValues: logged
      ? { date: toIsoDate(logged), time: clockOf(logged) }
      : (devPrefill?.imagingTime ?? { date: "", time: "" }),
  });

  function onSubmit(values: ImagingTimeValues) {
    logTime.mutate(values, {
      onSuccess: () => onSaved({ edited: logged !== null }),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      {logged ? (
        <FormDialogHeader
          title="Change imaging time"
          description="Update when this scan takes place."
        />
      ) : (
        <FormDialogHeader title="Imaging Info" description="Kindly fill up to proceed!" />
      )}

      <FormDialogBody>
        <section
          aria-label="Patient"
          className="flex flex-col gap-1 rounded-lg border bg-background px-4 py-3"
        >
          <p className="type-label text-fg-caption">Patient</p>
          <p className="type-body-sm-tight-semibold text-fg-heading">{order.patient.name}</p>
          <p className="type-caption text-fg-caption">
            Scan Requested:{" "}
            <span className="text-fg-heading">
              {order.modality} ({order.bodyPart.toLowerCase()})
            </span>
          </p>
          {logged && (
            <p className="type-caption text-fg-caption">
              Currently booked for:{" "}
              <span className="text-fg-heading">{formatDateDotTime(logged)}</span>
            </p>
          )}
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          <Controller
            name="date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="imagingDate" className="gap-1">
                  Date of imaging <RequiredMark />
                </FieldLabel>
                <DateInput
                  ref={field.ref}
                  id="imagingDate"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  min={requestedAt}
                  invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            name="time"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="imagingTime" className="gap-1">
                  Time of imaging <RequiredMark />
                </FieldLabel>
                <TimeInput
                  ref={field.ref}
                  id="imagingTime"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>
      </FormDialogBody>

      <FormDialogFooter>
        <Button type="submit" loading={logTime.isPending} className="h-11 px-5 type-heading-sm">
          {logged ? (
            "Save changes"
          ) : (
            <>
              Submit Entry
              <CaretRightIcon data-icon="inline-end" />
            </>
          )}
        </Button>
      </FormDialogFooter>
    </form>
  );
}

/** "HH:MM" on the 24-hour clock, as TimeInput takes it. */
function clockOf(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
