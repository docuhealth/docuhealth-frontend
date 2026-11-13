import { CaretRightIcon } from "@phosphor-icons/react";
import { FormDialogBody, FormDialogFooter } from "@/components/dashboard/form-dialog";
import { Button } from "@/components/ui/button";
import type { FoundPatient } from "@/features/receptionist/api/schemas";
import { NoMatchCard, PatientSearchField } from "@/features/receptionist/components/patient-search";
import { devPrefill } from "@/features/receptionist/lib/dev-prefill";
import { usePatientSearch } from "@/features/receptionist/lib/use-patient-search";

/**
 * "Find patient", the first step of booking: a HIN field, the patients it matches (the only
 * match is picked already), and Continue with the one picked. `initialHin` brings back the HIN
 * typed before, after "Change" on the next step.
 */
export function FindPatientStep({
  initialHin,
  onContinue,
  onRegisterPatient,
}: {
  initialHin?: string;
  onContinue: (patient: FoundPatient) => void;
  onRegisterPatient: () => void;
}) {
  const search = usePatientSearch(initialHin ?? devPrefill?.checkIn.hin);
  const { picked, status } = search;

  return (
    <>
      <FormDialogBody minHeight="20rem" className="gap-5">
        <PatientSearchField
          search={search}
          inputId="appointmentHin"
          noMatch={
            // Most likely a walk-in: register them and carry on booking.
            <NoMatchCard
              title={`No HIN result “${search.hin}”`}
              actionLabel="Register new patient"
              onAction={onRegisterPatient}
            >
              If this is a walk-in who isn’t in the system yet, register them and you’ll go straight
              on to booking.
            </NoMatchCard>
          }
        />
        {status === "found" && (
          <p className="type-body-sm-regular text-fg-caption">
            Not the right person?{" "}
            <button
              type="button"
              onClick={onRegisterPatient}
              className="text-primary underline underline-offset-2 hover:text-brand-hover"
            >
              Register a new patient
            </button>
          </p>
        )}
      </FormDialogBody>

      <FormDialogFooter>
        {/* With no one to pick, registering them (above) is the way on. */}
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
