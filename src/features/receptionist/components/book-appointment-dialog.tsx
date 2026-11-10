import { useState } from "react";
import { toast } from "sonner";
import { FormDialog, FormDialogHeader } from "@/components/dashboard/form-dialog";
import { SuccessDialog } from "@/components/success-dialog";
import { Button } from "@/components/ui/button";
import { useBookAppointment } from "@/features/receptionist/api/mutations";
import { AppointmentForm } from "@/features/receptionist/components/appointment-form";
import { FindPatientStep } from "@/features/receptionist/components/find-patient-step";
import { RegisterPatientForm } from "@/features/receptionist/components/register-patient-form";
import { devPrefill } from "@/features/receptionist/lib/dev-prefill";
import { getErrorMessage } from "@/lib/api";
import { formatHin } from "@/lib/format";

type Patient = {
  id: string;
  name: string;
  hin: string;
  phone: string | null;
  email?: string | null;
};

/** A date ("YYYY-MM-DD") and time ("HH:MM") to start the form on, e.g. a calendar slot. */
type Slot = { date: string; time: string };

/**
 * "Appointment Details" modal: the front desk picks a date and time (and an optional note) to
 * book `patient` in. Without a `patient`, it starts with "Find patient", looking them up by
 * HIN (step 1 of 2), or registering a walk-in no one has on file.
 * Once it's booked, "Appointment booked!" takes its place.
 */
export function BookAppointmentDialog({
  patient,
  slot,
  open,
  onOpenChange,
}: {
  patient?: Patient;
  slot?: Slot;
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
            patient={patient}
            slot={slot}
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
        description="You have successfully booked a consultation for a patient"
        primaryAction={{ label: "Done", onClick: () => setBooked(false) }}
      />
    </>
  );
}

function BookAppointmentSteps({
  patient,
  slot,
  onBooked,
}: {
  patient?: Patient;
  slot?: Slot;
  onBooked: () => void;
}) {
  const [found, setFound] = useState<Patient | null>(null);
  // Only a patient found or registered here (not one handed in) can be swapped for someone else.
  const [step, setStep] = useState<"find" | "register" | "details">("find");
  const chosen = patient ?? (step === "details" ? found : null);

  if (step === "register" && !patient) {
    // A walk-in: register them (three steps of their own), then book them straight away.
    return (
      <RegisterPatientForm
        submitLabel="Register and Continue"
        onExit={() => setStep("find")}
        onRegistered={({ id, name, hin, phone, email }) => {
          setFound({ id, name, hin, phone, email });
          setStep("details");
          toast.success(`${name} is registered. Their HIN is ${formatHin(hin)}.`);
        }}
      />
    );
  }

  if (!chosen) {
    return (
      <>
        <FormDialogHeader
          title="Find patient"
          description="Search patient by HIN"
          progress={{ step: 1, total: 2 }}
        />
        <FindPatientStep
          initialHin={found ? formatHin(found.hin) : undefined}
          onContinue={({ id, name, hin, phone, email }) => {
            setFound({ id, name, hin, phone, email });
            setStep("details");
          }}
          onRegisterPatient={() => setStep("register")}
        />
      </>
    );
  }

  return (
    <>
      <FormDialogHeader
        title="Appointment Details"
        description="Add the details for this appointment."
        progress={patient ? undefined : { step: 2, total: 2 }}
      />
      <BookAppointmentForm
        patient={chosen}
        slot={slot}
        onChangePatient={patient ? undefined : () => setStep("find")}
        onBooked={onBooked}
      />
    </>
  );
}

function BookAppointmentForm({
  patient,
  slot,
  onChangePatient,
  onBooked,
}: {
  patient: Patient;
  slot?: Slot;
  onChangePatient?: () => void;
  onBooked: () => void;
}) {
  const book = useBookAppointment();

  return (
    <AppointmentForm
      patient={patient}
      defaultValues={{
        ...(devPrefill?.bookAppointment ?? { date: "", time: "", note: "" }),
        ...slot,
      }}
      submitLabel="Book Appointment"
      pending={book.isPending}
      patientAction={
        onChangePatient && (
          <Button
            type="button"
            variant="outline"
            onClick={onChangePatient}
            className="h-9 shrink-0 bg-card px-4 type-body-sm-medium text-fg-heading"
          >
            Change
          </Button>
        )
      }
      onSubmit={({ at, note }) =>
        book.mutate(
          { patientId: patient.id, at, note },
          { onSuccess: onBooked, onError: (error) => toast.error(getErrorMessage(error)) },
        )
      }
    />
  );
}
