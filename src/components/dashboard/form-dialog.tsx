import { XIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/**
 * The dashboard's form modals (Add Facility, Add Staff): a header with title, description and a
 * round close button, a scrolling body of fields, and a footer of buttons. On short screens
 * (phones held sideways) the header and footer tighten up to leave room for the fields.
 */
export function FormDialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100svh-2rem)] flex-col gap-0 p-0 sm:max-w-xl"
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

/** `progress` swaps the header's bottom border for a step bar (e.g. step 1 of 2). */
export function FormDialogHeader({
  title,
  description,
  progress,
}: {
  title: string;
  description: string;
  progress?: { step: number; total: number };
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 px-6 pt-5 short:pt-3",
        progress ? "pb-1" : "border-b pb-5 short:pb-3",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <DialogTitle className="type-h4">{title}</DialogTitle>
          <DialogDescription className="type-body-sm-regular text-fg-caption">
            {description}
          </DialogDescription>
        </div>
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="shrink-0 rounded-full bg-line hover:bg-divider"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </div>
      {progress && (
        <div className="flex gap-2">
          <span className="sr-only">
            Step {progress.step} of {progress.total}
          </span>
          {Array.from({ length: progress.total }, (_, index) => (
            <span
              key={index}
              aria-hidden
              className={cn(
                "h-1 flex-1 rounded-full",
                index < progress.step ? "bg-primary" : "bg-line",
              )}
            />
          ))}
        </div>
      )}
    </header>
  );
}

export function FormDialogBody({ className, ...props }: ComponentProps<typeof FieldGroup>) {
  return (
    <FieldGroup
      className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-6 short:py-4", className)}
      {...props}
    />
  );
}

/**
 * Cancel on the left (closes the dialog; `closeLabel` renames it), the action on the right.
 * With `onBack`, the left button is "Go back" to the step before instead.
 */
export function FormDialogFooter({
  closeLabel = "Cancel",
  onBack,
  children,
}: {
  closeLabel?: string;
  onBack?: () => void;
  children: ReactNode;
}) {
  const leftButtonClass = "h-11 px-5 type-body-sm-medium";
  return (
    <footer className="flex items-center justify-between gap-3 border-t px-6 py-6 short:py-3">
      {onBack ? (
        <Button type="button" variant="outline" onClick={onBack} className={leftButtonClass}>
          Go back
        </Button>
      ) : (
        <DialogClose asChild>
          <Button type="button" variant="outline" className={leftButtonClass}>
            {closeLabel}
          </Button>
        </DialogClose>
      )}
      {children}
    </footer>
  );
}
