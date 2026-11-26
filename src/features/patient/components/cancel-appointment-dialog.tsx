import { useState } from "react";
import { toast } from "sonner";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { Button } from "@/components/ui/button";
import { FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCancelAppointment } from "@/features/patient/api/appointments";
import {
  type AppointmentView,
  type CancelReason,
  cancelReasons,
  dayAndTime,
} from "@/features/patient/lib/appointments";
import { getErrorMessage } from "@/lib/api";

/** "Cancel appointment?", with an optional reason, which the facility sees. */
export function CancelAppointmentDialog({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: AppointmentView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = useState<CancelReason | null>(null);
  const cancel = useCancelAppointment();
  const description = [
    dayAndTime(appointment.at),
    appointment.clinician && `with ${appointment.clinician.name}`,
    appointment.facility && `at ${appointment.facility}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      <FormDialogHeader title="Cancel appointment?" description={`${description}.`} />
      <FormDialogBody>
        <FieldSet>
          <FieldLegend variant="label" className="type-body-sm-medium text-fg-heading">
            Why are you cancelling?{" "}
            <span className="type-body-sm-regular text-fg-caption">(optional)</span>
          </FieldLegend>
          <RadioGroup
            value={reason ?? ""}
            onValueChange={(value) => setReason(value as CancelReason)}
            className="flex flex-col gap-2"
          >
            {Object.entries(cancelReasons).map(([value, label]) => (
              <FieldLabel
                key={value}
                htmlFor={`cancel-${value}`}
                className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-brand-50"
              >
                <RadioGroupItem value={value} id={`cancel-${value}`} />
                <span className="type-body-sm-regular text-fg-heading">{label}</span>
              </FieldLabel>
            ))}
          </RadioGroup>
        </FieldSet>
      </FormDialogBody>
      <FormDialogFooter closeLabel="Keep appointment">
        <Button
          type="button"
          loading={cancel.isPending}
          className="h-11 bg-error-500 px-5 type-heading-sm text-white hover:bg-error-700"
          onClick={() =>
            cancel.mutate(
              { id: appointment.id, reason: reason && cancelReasons[reason] },
              {
                onSuccess: () => {
                  onOpenChange(false);
                  toast.success("Your appointment is cancelled.");
                },
                onError: (error) => toast.error(getErrorMessage(error)),
              },
            )
          }
        >
          Cancel appointment
        </Button>
      </FormDialogFooter>
    </FormDialog>
  );
}
