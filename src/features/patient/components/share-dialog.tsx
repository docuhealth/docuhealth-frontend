import { useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/components/dashboard/form-dialog";
import {
  type ReadyShare,
  type Share,
  type ShareRequest,
  type StartedShare,
  useResendShareCode,
  useStartShare,
  useVerifyShare,
} from "@/features/patient/api/pending-sharing";
import { ShareDetailsStep } from "@/features/patient/components/share-details-step";
import { ShareReadyStep } from "@/features/patient/components/share-ready-step";
import { ShareVerifyStep } from "@/features/patient/components/share-verify-step";
import { getErrorMessage } from "@/lib/api";

/**
 * "Share my record": who and what, then the one-time code, then the access code to pass on.
 * `onStop` takes the share back from the last step (the dialog closes first).
 * TODO(api): nothing here is in the API yet; see `pending-sharing.ts`.
 */
export function ShareDialog({
  open,
  onOpenChange,
  onStop,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStop: (share: Share) => void;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {/* Remounts on each open, so it starts fresh. */}
      {open && (
        <ShareSteps
          onStop={(share) => {
            onOpenChange(false);
            onStop(share);
          }}
        />
      )}
    </FormDialog>
  );
}

function ShareSteps({ onStop }: { onStop: (share: Share) => void }) {
  const start = useStartShare();
  const resend = useResendShareCode();
  const verify = useVerifyShare();
  const [details, setDetails] = useState<ShareRequest | null>(null);
  const [started, setStarted] = useState<StartedShare | null>(null);
  const [ready, setReady] = useState<ReadyShare | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  if (ready) return <ShareReadyStep ready={ready} onStop={() => onStop(ready.share)} />;

  if (started) {
    return (
      <ShareVerifyStep
        sentTo={started.sentTo}
        pending={verify.isPending}
        error={codeError}
        onBack={() => {
          setStarted(null);
          setCodeError(null);
        }}
        onResend={() => resend.mutateAsync(started.requestId)}
        onVerify={(code) => {
          setCodeError(null);
          verify.mutate(
            { requestId: started.requestId, code },
            {
              onSuccess: setReady,
              onError: (error) => setCodeError(getErrorMessage(error)),
            },
          );
        }}
      />
    );
  }

  return (
    <ShareDetailsStep
      defaultValues={details}
      pending={start.isPending}
      onSubmit={(share) => {
        setDetails(share);
        start.mutate(share, {
          onSuccess: setStarted,
          onError: (error) => toast.error(getErrorMessage(error)),
        });
      }}
    />
  );
}
