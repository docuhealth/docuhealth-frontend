import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { CancelCircleIcon, TickIcon } from "@/components/hugeicons";
import { RequiredMark } from "@/components/required-mark";
import { DialogDescription } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useApproveResults, useReturnResults } from "@/features/lab-scientist/api/mutations";
import type { TestOrder } from "@/features/lab-scientist/api/schemas";
import { type RejectOrderValues, returnResultsSchema } from "@/features/lab-scientist/lib/schemas";
import { resultsAwaitingReview } from "@/features/lab-scientist/lib/stage";
import { getErrorMessage } from "@/lib/api";

// The lab admin's review of the results a lab scientist sent: approve them (they go on to the
// requesting doctor) or return them with a reason (the tests go back to in progress).

const testList = (order: TestOrder) =>
  resultsAwaitingReview(order)
    .map(({ name }) => name)
    .join(", ");

export function ApproveResultsDialog({
  order,
  onClose,
}: {
  order: TestOrder;
  onClose: () => void;
}) {
  const approve = useApproveResults(order);
  return (
    <ConfirmDialog
      tone="brand"
      icon={<TickIcon />}
      title="Approve results"
      confirmLabel="Approve"
      pending={approve.isPending}
      onClose={() => !approve.isPending && onClose()}
      onConfirm={() =>
        approve.mutate(undefined, {
          onSuccess: () => {
            toast.success(`${order.patient.name}’s results are approved.`);
            onClose();
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        })
      }
    >
      <DialogDescription className="type-body-regular text-fg-body">
        Approve {order.patient.name}’s {testList(order)} results? {order.requestedBy} will be able
        to see them.
      </DialogDescription>
    </ConfirmDialog>
  );
}

export function ReturnResultsDialog({ order, onClose }: { order: TestOrder; onClose: () => void }) {
  const giveBack = useReturnResults(order);
  const form = useForm<RejectOrderValues>({
    resolver: zodResolver(returnResultsSchema),
    defaultValues: { reason: "" },
  });
  const { errors } = form.formState;

  function onSubmit(values: RejectOrderValues) {
    giveBack.mutate(values, {
      onSuccess: () => {
        toast.success(`${order.patient.name}’s results are sent back to the lab.`);
        onClose();
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <ConfirmDialog
      tone="danger"
      icon={<CancelCircleIcon />}
      title="Return results"
      confirmLabel="Return results"
      pending={giveBack.isPending}
      onClose={() => !giveBack.isPending && onClose()}
      onConfirm={() => void form.handleSubmit(onSubmit)()}
    >
      <DialogDescription className="type-body-regular text-fg-body">
        {testList(order)} will go back to in progress, for a new sample and result. The lab
        scientist will see your note.
      </DialogDescription>
      <Field data-invalid={!!errors.reason}>
        <FieldLabel htmlFor="returnResultsReason" className="gap-1">
          Add note <RequiredMark />
        </FieldLabel>
        <Textarea
          id="returnResultsReason"
          placeholder="e.g. The sample was haemolysed; please repeat the test"
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
