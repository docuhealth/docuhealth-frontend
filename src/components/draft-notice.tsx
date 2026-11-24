import { ClockCounterClockwiseIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * "Restored your unsaved draft", with a way to throw it away: shown at the top of a form that
 * `useFormDraft` filled back in. Renders nothing when nothing was restored.
 */
export function DraftNotice({
  restored,
  onDiscard,
  className,
}: {
  restored: boolean;
  onDiscard: () => void;
  className?: string;
}) {
  if (!restored) return null;
  return (
    <p
      className={cn(
        "flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 type-caption text-fg-body",
        className,
      )}
    >
      <ClockCounterClockwiseIcon className="size-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="flex-1">We restored what you’d typed before.</span>
      <button
        type="button"
        onClick={onDiscard}
        className="text-primary underline underline-offset-2"
      >
        Discard
      </button>
    </p>
  );
}
