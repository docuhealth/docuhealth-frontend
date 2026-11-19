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
import { useLogSampleCollection } from "@/features/lab-scientist/api/mutations";
import type { TestOrder } from "@/features/lab-scientist/api/schemas";
import { devPrefill } from "@/features/lab-scientist/lib/dev-prefill";
import {
  clockOf,
  type SampleCollectionValues,
  sampleCollectionSchema,
} from "@/features/lab-scientist/lib/schemas";
import { testNames } from "@/features/lab-scientist/lib/stage";
import { getErrorMessage } from "@/lib/api";
import { toIsoDate } from "@/lib/date-input";

/**
 * "Sample Collection Info": when an accepted order's sample was taken. If one is already logged
 * it opens as "Edit Sample Collection Info", on that time.
 */
export function SampleCollectionDialog({
  order,
  open,
  onOpenChange,
}: {
  order: TestOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {/* Mounts with the dialog, so it starts from the order as it is now. */}
      {open && <SampleCollectionForm order={order} onSaved={() => onOpenChange(false)} />}
    </FormDialog>
  );
}

function SampleCollectionForm({ order, onSaved }: { order: TestOrder; onSaved: () => void }) {
  const logSample = useLogSampleCollection(order.id);
  const [requestedAt] = useState(() => new Date(order.requestedAt));
  const [schema] = useState(() => sampleCollectionSchema(requestedAt));
  // Read once on mount: saving updates the order, which mustn't flip this mid-save.
  const [logged] = useState(() =>
    order.sampleCollectedAt ? new Date(order.sampleCollectedAt) : null,
  );

  const form = useForm<SampleCollectionValues>({
    resolver: zodResolver(schema),
    defaultValues: logged
      ? { date: toIsoDate(logged), time: clockOf(logged) }
      : (devPrefill?.sampleCollection ?? { date: "", time: "" }),
  });

  function onSubmit(values: SampleCollectionValues) {
    logSample.mutate(values, {
      onSuccess: () => {
        onSaved();
        toast.success(logged ? "Sample collection updated." : "Sample collection logged.");
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
        title={logged ? "Edit Sample Collection Info" : "Sample Collection Info"}
        description="Kindly fill up to proceed!"
      />

      <FormDialogBody>
        <section
          aria-label="Patient"
          className="flex flex-col gap-1 rounded-lg border bg-background px-4 py-3"
        >
          <p className="type-label text-fg-caption">Patient</p>
          <p className="type-body-sm-tight-semibold text-fg-heading">{order.patient.name}</p>
          <p className="type-caption text-fg-caption">
            Test Requested: <span className="text-fg-heading">{testNames(order.tests)}</span>
          </p>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          <Controller
            name="date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sampleDate" className="gap-1">
                  {logged ? "New sample collection date" : "Sample collection date"}{" "}
                  <RequiredMark />
                </FieldLabel>
                <DateInput
                  ref={field.ref}
                  id="sampleDate"
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
                <FieldLabel htmlFor="sampleTime" className="gap-1">
                  {logged ? "New sample collection time" : "Sample collection time"}{" "}
                  <RequiredMark />
                </FieldLabel>
                <TimeInput
                  ref={field.ref}
                  id="sampleTime"
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
        <Button type="submit" loading={logSample.isPending} className="h-11 px-5 type-heading-sm">
          {logged ? "Update entry" : "Submit entry"}
          <CaretRightIcon data-icon="inline-end" />
        </Button>
      </FormDialogFooter>
    </form>
  );
}
