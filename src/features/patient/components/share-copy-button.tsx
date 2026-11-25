import { CheckIcon, type Icon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** A quiet button that copies `text`, with a tick for a moment once it's copied. */
export function ShareCopyButton({
  text,
  label,
  copiedMessage,
  icon: ButtonIcon,
}: {
  text: string;
  label: string;
  copiedMessage: string;
  icon: Icon;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(copiedMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn’t copy. Select it and copy it yourself.");
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => void copy()}
      className="type-caption-medium text-primary hover:bg-brand-50 hover:text-primary"
    >
      {copied ? (
        <CheckIcon weight="bold" data-icon="inline-start" className="text-success-500" />
      ) : (
        <ButtonIcon data-icon="inline-start" />
      )}
      {label}
    </Button>
  );
}
