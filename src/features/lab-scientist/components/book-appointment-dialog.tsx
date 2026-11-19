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
import { NoMatchCard, PatientSearchField } from "@/components/dashboard/patient-search";
import { PatientSummary } from "@/components/dashboard/patient-summary";
import { DateInput } from "@/components/date-input";
import { RequiredMark } from "@/components/required-mark";
import { SuccessDialog } from "@/components/success-dialog";
import { TimeInput } from "@/components/time-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useBookTestAppointment } from "@/features/lab-scientist/api/mutations";
import { patientLookupQuery } from "@/features/lab-scientist/api/queries";
import type { FoundPatient } from "@/features/lab-scientist/api/schemas";
import { devPrefill } from "@/features/lab-scientist/lib/dev-prefill";
import { type BookTestValues, bookTestSchema } from "@/features/lab-scientist/lib/schemas";
import { usePatientSearch } from "@/hooks/use-patient-search";
import { getErrorMessage } from "@/lib/api";
import { formatHin } from "@/lib/format";

/**
 * "Book Appointment" for a test: find the patient by HIN (step 1 of 2), then a date, time and an
 * optional note (step 2). Once it's booked, "Appointment booked!" takes its place.
 */
export function BookAppointmentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [booked, setBooked] = useState(false);

  return (
    <>
      <FormDialog open={open} onOpenChange={onOpenChange}>
        {/* Remounts on each open, so it starts fresh. */}
        {open && (
          <BookAppointmentSteps
            onBooked={() => {
              onOpenChange(false);
              setBooked(true);
            }}
          />
        )}
      </FormDialog>
      <SuccessDialog
        open={booked}
        onOpenChange={setBooked}
        title="Appointment booked!"
        description="You have successfully booked a test appointment for a patient"
        primaryAction={{ label: "Done", onClick: () => setBooked(false) }}
      />
    </>
  );
}

function BookAppointmentSteps({ onBooked }: { onBooked: () => void }) {
  const [patient, setPatient] = useState<FoundPatient | null>(null);
  const [step, setStep] = useState<"find" | "details">("find");

  if (step === "find" || !patient) {
    return (
      <>
        <FormDialogHeader
          title="Find patient"
          description="Search patient by HIN"
          progress={{ step: 1, total: 2 }}
        />
        <FindPatientStep
          initialHin={patient ? formatHin(patient.hin) : undefined}
          onContinue={(found) => {
            setPatient(found);
            setStep("details");
          }}
        />
      </>
    );
  }

  return (
    <>
      <FormDialogHeader
        title="Appointment Details"
        description="Add the details for this test appointment."
        progress={{ step: 2, total: 2 }}
      />
      <BookTestForm patient={patient} onChangePatient={() => setStep("find")} onBooked={onBooked} />
    </>
  );
}

function FindPatientStep({
  initialHin,
  onContinue,
}: {
  initialHin?: string;
  onContinue: (patient: FoundPatient) => void;
}) {
  const search = usePatientSearch(patientLookupQuery, initialHin ?? devPrefill?.bookTestHin);
  const { picked, status } = search;

  return (
    <>
      <FormDialogBody minHeight="20rem" className="gap-5">
        <PatientSearchField
          search={search}
          inputId="testAppointmentHin"
          noMatch={
            <NoMatchCard title={`No HIN result “${search.hin}”`}>
              Check the HIN with the patient. If they aren’t registered yet, the front desk can
              register them first.
            </NoMatchCard>
          }
        />
      </FormDialogBody>

      <FormDialogFooter>
        {status !== "none" && (
          <Button
            type="button"
            disabled={!picked}
            onClick={() => picked && onContinue(picked)}
            className="h-11 gap-2 px-5 type-heading-sm has-data-[icon=inline-end]:pr-4"
          >
            Continue
            <CaretRightIcon data-icon="inline-end" />
          </Button>
        )}
      </FormDialogFooter>
    </>
  );
}

function BookTestForm({
  patient,
  onChangePatient,
  onBooked,
}: {
  patient: FoundPatient;
  onChangePatient: () => void;
  onBooked: () => void;
}) {
  const book = useBookTestAppointment();
  // Midnight today: earlier days can't be picked.
  const [today] = useState(() => new Date(new Date().setHours(0, 0, 0, 0)));
  const form = useForm<BookTestValues>({
    resolver: zodResolver(bookTestSchema),
    defaultValues: devPrefill?.bookTest ?? { date: "", time: "", note: "" },
  });
  const { errors } = form.formState;

  return (
    <form
      onSubmit={form.handleSubmit((values) =>
        book.mutate(
          { patientId: patient.id, values },
          { onSuccess: onBooked, onError: (error) => toast.error(getErrorMessage(error)) },
        ),
      )}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <FormDialogBody>
        <PatientSummary
          patient={patient}
          action={
            <Button
              type="button"
              variant="outline"
              onClick={onChangePatient}
              className="h-9 shrink-0 bg-card px-4 type-body-sm-medium text-fg-heading"
            >
              Change
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Controller
            name="date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="testAppointmentDate" className="gap-1">
                  Date <RequiredMark />
                </FieldLabel>
                <DateInput
                  ref={field.ref}
                  id="testAppointmentDate"
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

          <Controller
            name="time"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="testAppointmentTime" className="gap-1">
                  Time <RequiredMark />
                </FieldLabel>
                <TimeInput
                  ref={field.ref}
                  id="testAppointmentTime"
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

        <Field data-invalid={!!errors.note}>
          <FieldLabel htmlFor="testAppointmentNote">
            Add note <span className="font-normal text-fg-caption">(optional)</span>
          </FieldLabel>
          <Textarea
            id="testAppointmentNote"
            placeholder="Type here"
            aria-invalid={!!errors.note}
            className="min-h-28 bg-card"
            {...form.register("note")}
          />
          <FieldError errors={[errors.note]} />
        </Field>
      </FormDialogBody>

      <FormDialogFooter>
        <Button type="submit" loading={book.isPending} className="h-11 px-5 type-heading-sm">
          Book Appointment
        </Button>
      </FormDialogFooter>
    </form>
  );
}
