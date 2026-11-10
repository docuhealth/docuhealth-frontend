import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";

/** A small icon button that copies `hin`, showing a tick for a moment once it's copied. */
export function CopyHinButton({ hin, failureMessage }: { hin: string; failureMessage: string }) {
  const [copied, setCopied] = useState(false);

  async function copyHin() {
    try {
      await navigator.clipboard.writeText(hin);
      setCopied(true);
      toast.success("HIN copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(failureMessage);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copyHin()}
      aria-label={copied ? "HIN copied" : "Copy HIN"}
      className="grid size-6 place-content-center rounded-sm text-fg-caption transition-colors hover:bg-card hover:text-primary"
    >
      {copied ? (
        <CheckIcon weight="bold" className="size-4 text-success-500" />
      ) : (
        <CopyIcon className="size-4" />
      )}
    </button>
  );
}
