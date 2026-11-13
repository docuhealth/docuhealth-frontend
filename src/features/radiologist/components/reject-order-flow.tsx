import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { RequiredMark } from "@/components/required-mark";
import { SuccessDialog } from "@/components/success-dialog";
import { DialogDescription } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useRejectScanOrder } from "@/features/radiologist/api/mutations";
import type { ScanOrder } from "@/features/radiologist/api/schemas";
import { CancelCircleIcon } from "@/features/radiologist/components/icons";
import { devPrefill } from "@/features/radiologist/lib/dev-prefill";
import { type RejectOrderValues, rejectOrderSchema } from "@/features/radiologist/lib/schemas";
import { getErrorMessage } from "@/lib/api";

/** "Reject request": a note saying why, for the requesting doctor, then "Order Rejected!". */
export function RejectOrderFlow({
  order,
  open,
  onOpenChange,
}: {
  order: ScanOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [rejected, setRejected] = useState(false);

  return (
    <>
      {/* Mounted only while open, so every opening starts with a fresh note. */}
      {open && (
        <RejectOrderForm
          order={order}
          onClose={() => onOpenChange(false)}
          onRejected={() => {
            onOpenChange(false);
            setRejected(true);
          }}
        />
      )}
      <SuccessDialog
        open={rejected}
        onOpenChange={setRejected}
        title="Order Rejected!"
        description={`${order.requestedBy} has been told why, and can send a new request.`}
        primaryAction={{ label: "Done", onClick: () => setRejected(false) }}
      />
    </>
  );
}

function RejectOrderForm({
  order,
  onClose,
  onRejected,
}: {
  order: ScanOrder;
  onClose: () => void;
  onRejected: () => void;
}) {
  const reject = useRejectScanOrder(order.id);
  const form = useForm<RejectOrderValues>({
    resolver: zodResolver(rejectOrderSchema),
    defaultValues: devPrefill?.rejectOrder ?? { reason: "" },
  });
  const { errors } = form.formState;

  function onSubmit(values: RejectOrderValues) {
    reject.mutate(values, {
      onSuccess: onRejected,
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <ConfirmDialog
      tone="danger"
      icon={<CancelCircleIcon />}
      title="Reject scan order"
      confirmLabel="Reject request"
      pending={reject.isPending}
      onClose={() => !reject.isPending && onClose()}
      onConfirm={() => void form.handleSubmit(onSubmit)()}
    >
      <DialogDescription className="sr-only">
        Say why you’re rejecting {order.patient.name}’s {order.modality.toLowerCase()} request.{" "}
        {order.requestedBy} will see your note.
      </DialogDescription>
      <Field data-invalid={!!errors.reason}>
        <FieldLabel htmlFor="rejectReason" className="gap-1">
          Add note <RequiredMark />
        </FieldLabel>
        <Textarea
          id="rejectReason"
          placeholder={`Tell ${order.requestedBy} why, e.g. the scan doesn’t match the clinical question`}
          aria-required
          aria-invalid={!!errors.reason}
          className="min-h-32 bg-card"
          {...form.register("reason")}
        />
        <FieldError errors={[errors.reason]} />
      </Field>
    </ConfirmDialog>
  );
}
