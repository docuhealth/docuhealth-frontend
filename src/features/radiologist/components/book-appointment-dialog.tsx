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
// For the scan type and body part fields, hidden for now:
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBookScanAppointment } from "@/features/radiologist/api/mutations";
import { patientLookupQuery } from "@/features/radiologist/api/queries";
import type { FoundPatient } from "@/features/radiologist/api/schemas";
// import { scanModalityLabels } from "@/features/radiologist/api/schemas";
import { devPrefill } from "@/features/radiologist/lib/dev-prefill";
import {
  type BookScanInput,
  type BookScanValues,
  bookScanSchema,
} from "@/features/radiologist/lib/schemas";
import { usePatientSearch } from "@/hooks/use-patient-search";
import { getErrorMessage } from "@/lib/api";
import { formatHin } from "@/lib/format";

/**
 * "Book Appointment" for a scan: find the patient by HIN (step 1 of 2), then the date, time and
 * an optional note (step 2). The scan type and body part fields are commented out for now. Once it's booked, "Appointment booked!" takes its place.
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
        description="You have successfully booked a scan appointment for a patient"
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
        description="Add the details for this scan appointment."
        progress={{ step: 2, total: 2 }}
      />
      <BookScanForm patient={patient} onChangePatient={() => setStep("find")} onBooked={onBooked} />
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
  const search = usePatientSearch(patientLookupQuery, initialHin ?? devPrefill?.bookScanHin);
  const { picked, status } = search;

  return (
    <>
      <FormDialogBody minHeight="20rem" className="gap-5">
        <PatientSearchField
          search={search}
          inputId="scanAppointmentHin"
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

function BookScanForm({
  patient,
  onChangePatient,
  onBooked,
}: {
  patient: FoundPatient;
  onChangePatient: () => void;
  onBooked: () => void;
}) {
  const book = useBookScanAppointment();
  // Midnight today: earlier days can't be picked.
  const [today] = useState(() => new Date(new Date().setHours(0, 0, 0, 0)));
  const form = useForm<BookScanInput, unknown, BookScanValues>({
    resolver: zodResolver(bookScanSchema),
    defaultValues: devPrefill?.bookScan ?? {
      // modality: "",
      // bodyPart: "",
      date: "",
      time: "",
      note: "",
    },
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
          {/* Scan type and body part are hidden for now.
          <Controller
            name="modality"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="scanModality" className="gap-1">
                  Scan type <RequiredMark />
                </FieldLabel>
                <Select
                  name={field.name}
                  items={scanModalityLabels}
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                >
                  <SelectTrigger
                    id="scanModality"
                    aria-required
                    aria-invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                    className="w-full bg-card"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(scanModalityLabels).map(([value, label]) => (
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

          <Field data-invalid={!!errors.bodyPart}>
            <FieldLabel htmlFor="scanBodyPart" className="gap-1">
              Body part <RequiredMark />
            </FieldLabel>
            <Input
              id="scanBodyPart"
              autoComplete="off"
              placeholder="e.g. Chest"
              aria-required
              aria-invalid={!!errors.bodyPart}
              className="bg-card"
              {...form.register("bodyPart")}
            />
            <FieldError errors={[errors.bodyPart]} />
          </Field> */}

          <Controller
            name="date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="scanAppointmentDate" className="gap-1">
                  Date <RequiredMark />
                </FieldLabel>
                <DateInput
                  ref={field.ref}
                  id="scanAppointmentDate"
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
                <FieldLabel htmlFor="scanAppointmentTime" className="gap-1">
                  Time <RequiredMark />
                </FieldLabel>
                <TimeInput
                  ref={field.ref}
                  id="scanAppointmentTime"
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
          <FieldLabel htmlFor="scanAppointmentNote">
            Add note <span className="font-normal text-fg-caption">(optional)</span>
          </FieldLabel>
          <Textarea
            id="scanAppointmentNote"
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
