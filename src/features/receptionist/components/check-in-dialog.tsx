import { FormDialog, FormDialogHeader } from "@/components/dashboard/form-dialog";
import { PatientLookup } from "@/features/receptionist/components/patient-lookup";

/**
 * Check-in patient: the receptionist types a HIN and, once it's complete, sees the patient it
 * belongs to (a link to their profile), or a prompt to register them if there's no one.
 */
export function CheckInDialog({
  open,
  onOpenChange,
  onRegisterPatient,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisterPatient: () => void;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      <FormDialogHeader title="Check-in patient" description="Enter patient HIN" />
      {/* Remounts on each open, so the HIN starts fresh. */}
      {open && (
        <PatientLookup
          inputId="checkInHin"
          onRegisterPatient={() => {
            onOpenChange(false);
            onRegisterPatient();
          }}
        />
      )}
    </FormDialog>
  );
}
