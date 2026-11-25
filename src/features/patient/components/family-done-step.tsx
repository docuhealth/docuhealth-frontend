import { CheckIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogTitle } from "@/components/ui/dialog";

/** The end of adding a dependant or a proxy: a green check, what happened, and Done. */
export function FamilyDoneStep({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 p-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="grid size-16 place-content-center rounded-full bg-success-100">
          <span className="grid size-11 place-content-center rounded-full bg-success-500 text-white">
            <CheckIcon weight="bold" className="size-6" />
          </span>
        </span>
        <DialogTitle className="type-h4 text-fg-heading">{title}</DialogTitle>
        <DialogDescription className="max-w-90 type-body-sm-regular text-fg-caption">
          {description}
        </DialogDescription>
      </header>
      {children}
      <DialogClose asChild>
        <Button type="button" className="h-11 w-full type-heading-sm">
          Done
        </Button>
      </DialogClose>
    </div>
  );
}
