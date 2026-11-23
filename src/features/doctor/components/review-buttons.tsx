import { zodResolver } from "@hookform/resolvers/zod";
import { XCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useReviewResult } from "@/features/doctor/api/results";
import { getErrorMessage } from "@/lib/api";

const rejectSchema = z.object({
  reason: z.string().trim().min(1, "Say why the result is rejected"),
});

/**
 * Approve a result, or reject it with a reason (it goes back to the lab or the radiologist).
 * `name` words it, e.g. "the Full blood count result".
 */
export function ReviewButtons({
  kind,
  id,
  name,
}: {
  kind: "lab" | "scan";
  id: string;
  name: string;
}) {
  const review = useReviewResult();
  const [rejecting, setRejecting] = useState(false);
  const form = useForm<z.infer<typeof rejectSchema>>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: "" },
  });
  const { errors } = form.formState;
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);

  function reject({ reason }: z.infer<typeof rejectSchema>) {
    review.mutate(
      { kind, id, decision: { approve: false, reason } },
      {
        onSuccess: () => {
          toast.success(`${capitalized} is rejected and sent back.`);
          setRejecting(false);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={review.isPending}
        aria-label={`Reject ${name}`}
        onClick={() => {
          form.reset();
          setRejecting(true);
        }}
        className="bg-card type-caption-semibold font-sans text-fg-heading"
      >
        Reject
      </Button>
      <Button
        size="sm"
        loading={review.isPending && !rejecting}
        disabled={review.isPending}
        aria-label={`Approve ${name}`}
        onClick={() =>
          review.mutate(
            { kind, id, decision: { approve: true } },
            {
              onSuccess: () => toast.success(`${capitalized} is approved.`),
              onError: (error) => toast.error(getErrorMessage(error)),
            },
          )
        }
        className="type-caption-semibold font-sans"
      >
        Approve
      </Button>

      {rejecting && (
        <ConfirmDialog
          tone="danger"
          icon={<XCircleIcon />}
          title="Reject result"
          confirmLabel="Reject result"
          pending={review.isPending}
          onClose={() => !review.isPending && setRejecting(false)}
          onConfirm={() => void form.handleSubmit(reject)()}
        >
          <DialogDescription className="type-body-regular text-fg-body">
            {capitalized} goes back to be done again. They’ll see your reason.
          </DialogDescription>
          <Field data-invalid={!!errors.reason}>
            <FieldLabel htmlFor={`reject-${id}`} className="gap-1">
              Reason <RequiredMark />
            </FieldLabel>
            <Textarea
              id={`reject-${id}`}
              placeholder="e.g. The values don’t fit the clinical picture; please repeat"
              aria-required
              aria-invalid={!!errors.reason}
              className="min-h-24 bg-card"
              {...form.register("reason")}
            />
            <FieldError errors={[errors.reason]} />
          </Field>
        </ConfirmDialog>
      )}
    </div>
  );
}
