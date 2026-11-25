import { ProhibitIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { DialogDescription } from "@/components/ui/dialog";
import { type Share, useStopShare } from "@/features/patient/api/pending-sharing";
import { sharedItems } from "@/features/patient/lib/sharing";
import { getErrorMessage } from "@/lib/api";

/** "Stop sharing?": once confirmed the share ends and its access code stops working. */
export function ShareStopDialog({ share, onClose }: { share: Share; onClose: () => void }) {
  const stop = useStopShare();
  return (
    <ConfirmDialog
      tone="danger"
      icon={<ProhibitIcon />}
      title="Stop sharing?"
      confirmLabel="Stop sharing"
      pending={stop.isPending}
      onClose={onClose}
      onConfirm={() =>
        stop.mutate(share.id, {
          onSuccess: () => {
            toast.success(`You’ve stopped sharing with ${share.recipient.name}.`);
            onClose();
          },
          onError: (error) => toast.error(getErrorMessage(error)),
        })
      }
    >
      <DialogDescription className="type-body-sm-regular text-fg-body">
        {share.recipient.name} will no longer see your {sharedItems(share.items).toLowerCase()}.
        Their access code and link stop working straight away.
      </DialogDescription>
    </ConfirmDialog>
  );
}
