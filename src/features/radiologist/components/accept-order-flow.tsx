import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { SuccessDialog } from "@/components/success-dialog";
import { DialogDescription } from "@/components/ui/dialog";
import { useAcceptScanOrder } from "@/features/radiologist/api/mutations";
import type { ScanOrder } from "@/features/radiologist/api/schemas";
import { InformationCircleIcon } from "@/features/radiologist/components/icons";
import { ImagingTimeDialog } from "@/features/radiologist/components/imaging-time-dialog";
import { getErrorMessage } from "@/lib/api";
import { formatDateCommaTime } from "@/lib/format";

/**
 * "Accept request": confirm, which accepts the order, then log when the imaging takes place,
 * then "Order Approved!". Closing the imaging step leaves the order accepted; its time can be
 * logged later from the order page.
 */
export function AcceptOrderFlow({
  order,
  open,
  onOpenChange,
}: {
  order: ScanOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const accept = useAcceptScanOrder(order.id);
  const [logging, setLogging] = useState(false);
  const [approved, setApproved] = useState(false);

  return (
    <>
      {open && (
        <ConfirmDialog
          tone="brand"
          icon={<InformationCircleIcon />}
          title="Confirm Test Acceptance"
          confirmLabel="Accept & Log Imaging Time"
          pending={accept.isPending}
          onClose={() => !accept.isPending && onOpenChange(false)}
          onConfirm={() =>
            accept.mutate(undefined, {
              onSuccess: () => {
                onOpenChange(false);
                setLogging(true);
              },
              onError: (error) => toast.error(getErrorMessage(error)),
            })
          }
        >
          <DialogDescription className="type-body-regular text-fg-body">
            By proceeding you confirm that you are ready and able to carry out the requested scan.
            The date and time of imaging can be logged now or later.
          </DialogDescription>
        </ConfirmDialog>
      )}

      <ImagingTimeDialog
        order={order}
        open={logging}
        onOpenChange={(next) => {
          setLogging(next);
          if (!next) toast.success("Order accepted. Log the imaging time when it’s set.");
        }}
        onSaved={() => {
          setLogging(false);
          setApproved(true);
        }}
      />

      <SuccessDialog
        open={approved}
        onOpenChange={setApproved}
        title="Order Approved!"
        description={
          order.scheduledAt
            ? `The scan is booked for ${formatDateCommaTime(new Date(order.scheduledAt))}. ${order.requestedBy} can now see it’s under way.`
            : `${order.requestedBy} can now see the scan is under way.`
        }
        primaryAction={{ label: "Done", onClick: () => setApproved(false) }}
      />
    </>
  );
}
