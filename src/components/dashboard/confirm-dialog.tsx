import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const tones = {
  // Removing something.
  danger: {
    icon: "bg-error-500 text-white",
    confirm: "bg-error-100 text-error-500 hover:bg-error-100/70",
  },
  // Giving something back, e.g. adding someone back to the team.
  brand: {
    icon: "bg-primary text-primary-foreground",
    confirm: "bg-primary/10 text-primary hover:bg-primary/15",
  },
};

// Grows into the row's spare room, but never narrower than its label, so a pair that can't fit
// wraps instead of squeezing; just its own width once the dialog is wide enough.
const buttonClass = "h-11 grow px-5 whitespace-nowrap @sm:grow-0 @sm:px-8";

/**
 * "Are you sure?" before a change that matters, e.g. to someone's access or sharing a result:
 * `icon` and `title` in a header tinted by `tone`, the details in `children` (put the
 * explanation in a DialogDescription), then Cancel and a tinted `confirmLabel` button.
 * `size="lg"` widens it for a list, e.g. of people being removed.
 */
export function ConfirmDialog({
  tone,
  icon,
  title,
  confirmLabel,
  onConfirm,
  pending,
  onClose,
  size = "sm",
  children,
}: {
  tone: keyof typeof tones;
  icon: ReactNode;
  title: ReactNode;
  confirmLabel: ReactNode;
  onConfirm: () => void;
  pending: boolean;
  onClose: () => void;
  size?: "sm" | "lg";
  children: ReactNode;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex max-h-[calc(100svh-2rem)] flex-col gap-0 p-0",
          size === "lg" ? "sm:max-w-xl" : "sm:max-w-md",
        )}
      >
        <header className="flex items-center gap-3 border-b px-6 py-5 short:py-3">
          <span
            className={cn(
              "grid size-10 shrink-0 place-content-center rounded-md [&_svg]:size-5",
              tones[tone].icon,
            )}
          >
            {icon}
          </span>
          <DialogTitle className="type-accent-h4 text-fg-heading">{title}</DialogTitle>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-6 short:py-4">
          {children}
        </div>

        {/*
          Wide dialogs: the buttons at their own width, on the right. Narrow ones: side by side,
          sharing the row, and only when both labels can't fit on one line does the action wrap
          above Cancel (wrap-reverse), each then full width.
        */}
        <footer className="@container px-6 pb-6 short:pb-3">
          <div className="flex flex-wrap-reverse gap-3 @sm:justify-end">
            <Button variant="outline" className={buttonClass} onClick={onClose}>
              Cancel
            </Button>
            <Button
              className={cn(buttonClass, tones[tone].confirm)}
              loading={pending}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
