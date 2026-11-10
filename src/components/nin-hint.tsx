import { InfoIcon } from "@phosphor-icons/react";
import { useState, type PointerEvent } from "react";
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * The (i) next to a NIN label. Opens a white card under the icon explaining why we ask
 * for the NIN, with its arrow pointing back up at the icon. Tap or click toggles it;
 * a mouse hover also shows it.
 */
export function NinHint() {
  const [open, setOpen] = useState(false);
  const onHover = (show: boolean) => (event: PointerEvent) => {
    if (event.pointerType === "mouse") setOpen(show);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Why do we need your NIN?"
          onPointerEnter={onHover(true)}
          onPointerLeave={onHover(false)}
          className="rounded-full text-fg-caption transition-colors outline-none hover:text-fg-body focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:text-fg-body"
        >
          <InfoIcon className="size-4.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={6}
        arrowPadding={10}
        // Keep focus on the trigger so the form's tab order isn't disturbed.
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="block w-auto max-w-48 rounded-md border border-border bg-card px-2.5 py-2 text-center type-caption text-fg-body shadow-card ring-0"
      >
        We use your NIN to verify your identity and ensure accurate records. Your NIN is not stored
        by DocuHealth.
        {/* Bordered arrow: a rotated square whose two outer edges carry the border. */}
        <PopoverArrow asChild>
          <span className="block size-2.5 -translate-y-[calc(50%+1px)] rotate-45 border-r border-b border-border bg-card" />
        </PopoverArrow>
      </PopoverContent>
    </Popover>
  );
}
