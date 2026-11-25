import { useState } from "react";
import { toast } from "sonner";
import { FormDialog } from "@/components/dashboard/form-dialog";
import { isUnknownHin, type ProxyGrant, useAddProxy } from "@/features/patient/api/family";
import {
  AddProxyPowersStep,
  type ProxyAccess,
} from "@/features/patient/components/add-proxy-powers-step";
import { AddProxyWhoStep, type ProxyWho } from "@/features/patient/components/add-proxy-who-step";
import { FamilyDoneStep } from "@/features/patient/components/family-done-step";
import { getErrorMessage } from "@/lib/api";

/**
 * "Add a Proxy": who (HIN and relationship), what they may do and for how long, then "Request
 * sent!". An unknown HIN comes back as a 404 and returns to the first step to say so.
 */
export function AddProxyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {/* Remounts on each open, so it starts fresh. */}
      {open && <AddProxySteps />}
    </FormDialog>
  );
}

function AddProxySteps() {
  const add = useAddProxy();
  const [step, setStep] = useState<"who" | "powers">("who");
  const [who, setWho] = useState<ProxyWho | null>(null);
  const [access, setAccess] = useState<ProxyAccess | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [sent, setSent] = useState<ProxyGrant | null>(null);

  if (sent) {
    return (
      <FamilyDoneStep
        title="Request sent!"
        description={`We’ve asked ${sent.proxy.firstName} to confirm. They’ll only be able to see what you chose once they accept.`}
      />
    );
  }

  if (step === "powers" && who) {
    return (
      <AddProxyPowersStep
        defaultValues={access}
        pending={add.isPending}
        onBack={(next) => {
          setAccess(next);
          setStep("who");
        }}
        onSubmit={(next) => {
          setAccess(next);
          add.mutate(
            { ...who, ...next },
            {
              onSuccess: setSent,
              onError: (error) => {
                if (isUnknownHin(error)) {
                  setNotFound(true);
                  setStep("who");
                } else {
                  toast.error(getErrorMessage(error));
                }
              },
            },
          );
        }}
      />
    );
  }

  return (
    <AddProxyWhoStep
      // Remounts after a 404, so the error shows until the HIN is changed.
      key={notFound ? "not-found" : "who"}
      defaultValues={who}
      notFound={notFound}
      onContinue={(next) => {
        setWho(next);
        setNotFound(false);
        setStep("powers");
      }}
    />
  );
}
