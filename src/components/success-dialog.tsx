import { CheckIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type SuccessDialogAction = { label: string; onClick: () => void };

/**
 * The app's "it worked" modal: green check, title, message, then one or two buttons.
 *
 * - `children` go between the message and the buttons (e.g. the HIN box after sign-up).
 * - `header` adds a top bar with an icon and a context title (e.g. "No staff selected"); with
 *   it, the buttons sit at the end of the row instead of stretching full width.
 * - `dismissible={false}` leaves the buttons as the only way out, for results the user must
 *   read (like a HIN they need to write down).
 */
export function SuccessDialog({
  open,
  onOpenChange,
  dismissible = true,
  header,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  dismissible?: boolean;
  header?: { icon: ReactNode; title: string };
  title: string;
  description: ReactNode;
  children?: ReactNode;
  primaryAction: SuccessDialogAction;
  /** Shown before the primary button, outlined — typically "Undo". */
  secondaryAction?: SuccessDialogAction;
}) {
  const preventDismiss = dismissible ? undefined : (event: Event) => event.preventDefault();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={preventDismiss}
        onInteractOutside={preventDismiss}
        className={cn(
          "gap-0 overflow-hidden rounded-xl p-0 text-center",
          header ? "sm:max-w-130" : "sm:max-w-100",
        )}
      >
        {header && (
          <div className="flex items-center gap-3 border-b px-6 py-4 text-left">
            <span className="grid size-10 shrink-0 place-content-center rounded-md bg-secondary text-fg-body [&_svg]:size-5">
              {header.icon}
            </span>
            <p className="type-accent-h4 text-fg-heading">{header.title}</p>
          </div>
        )}

        <div className={cn("flex flex-col", header ? "px-6 pt-8 pb-6" : "p-8")}>
          <div className="mx-auto grid size-25 place-content-center rounded-full bg-success-100">
            <div className="grid size-16 place-content-center rounded-full bg-success-500 text-white">
              <CheckIcon weight="bold" className="size-8" />
            </div>
          </div>

          <DialogHeader className="mt-8 gap-2 text-center">
            <DialogTitle className="type-h3 text-fg-heading">{title}</DialogTitle>
            <DialogDescription className="type-body-sm-regular text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>

          {children && <div className="mt-8">{children}</div>}

          <div className={cn("mt-8 flex gap-3", header && "justify-end")}>
            {secondaryAction && (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
                className={cn("h-11 bg-card", header ? "px-8" : "flex-1")}
              >
                {secondaryAction.label}
              </Button>
            )}
            <Button
              onClick={primaryAction.onClick}
              className={cn("h-11", header ? "px-8" : "flex-1")}
            >
              {primaryAction.label}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
