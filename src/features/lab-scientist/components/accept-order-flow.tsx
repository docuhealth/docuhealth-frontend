import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { InformationCircleIcon } from "@/components/hugeicons";
import { SuccessDialog } from "@/components/success-dialog";
import { DialogDescription } from "@/components/ui/dialog";
import { useAcceptTestOrder } from "@/features/lab-scientist/api/mutations";
import type { TestOrder } from "@/features/lab-scientist/api/schemas";
import { getErrorMessage } from "@/lib/api";

/**
 * "Accept request": confirm, which accepts the order, then "Order Approved!". The sample's
 * collection is logged from the order page, now or later.
 */
export function AcceptOrderFlow({
  order,
  open,
  onOpenChange,
}: {
  order: TestOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const accept = useAcceptTestOrder(order);
  const [approved, setApproved] = useState(false);

  return (
    <>
      {open && (
        <ConfirmDialog
          tone="brand"
          icon={<InformationCircleIcon />}
          title="Confirm Test Acceptance"
          confirmLabel="Accept Request"
          pending={accept.isPending}
          onClose={() => !accept.isPending && onOpenChange(false)}
          onConfirm={() =>
            accept.mutate(undefined, {
              onSuccess: () => {
                onOpenChange(false);
                setApproved(true);
              },
              onError: (error) => toast.error(getErrorMessage(error)),
            })
          }
        >
          <DialogDescription className="type-body-regular text-fg-body">
            By proceeding you confirm that you are ready and capable of proceeding with the test
            requested. Kindly note that sample collection can be logged in now or later!
          </DialogDescription>
        </ConfirmDialog>
      )}

      <SuccessDialog
        open={approved}
        onOpenChange={setApproved}
        title="Order Approved!"
        description={`${order.requestedBy} can now see the test is under way. Log the sample collection when it’s taken.`}
        primaryAction={{ label: "Done", onClick: () => setApproved(false) }}
      />
    </>
  );
}
