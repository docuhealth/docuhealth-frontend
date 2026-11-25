import { CheckCircleIcon, ShieldCheckIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { PersonAvatar } from "@/components/dashboard/person-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { POWERS, type ProxyGrant, useProxyAction } from "@/features/patient/api/family";
import { accessLine, powerInfo, pronoun, requestExpiry } from "@/features/patient/lib/family";
import { getErrorMessage } from "@/lib/api";

/**
 * Someone asked the patient to be their proxy (or already has them as one): who, what they'd be
 * able to do, until when. A request is accepted or declined here; an accepted one can be stopped.
 */
export function ProxyReviewDialog({ grant, onClose }: { grant: ProxyGrant; onClose: () => void }) {
  const act = useProxyAction();
  const [now] = useState(() => new Date());
  const person = grant.grantedBy;
  const them = pronoun(person.gender);
  const pending = grant.status === "pending";

  const run = (action: "accept" | "decline" | "end", done: string) =>
    act.mutate(
      { id: grant.id, action },
      {
        onSuccess: () => {
          toast.success(done);
          onClose();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100svh-2rem)] flex-col gap-0 p-0 sm:max-w-md"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          <div className="flex items-center gap-3">
            <PersonAvatar name={person.name} src={null} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate type-body-sm-medium text-fg-heading">{person.name}</span>
              <span className="type-caption text-fg-caption">{grant.relationship}</span>
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
          <div className="flex flex-col gap-1">
            <DialogTitle className="type-h4 text-fg-heading">
              {pending
                ? `${person.name} wants to add you as ${them === "them" ? "their" : them} proxy`
                : `You’re ${person.firstName}’s proxy`}
            </DialogTitle>
            <DialogDescription className="type-body-sm-regular text-fg-caption">
              {pending
                ? `Here’s what you’d be able to do for ${them}.`
                : `Here’s what you can do for ${them}.`}
            </DialogDescription>
          </div>
          <ul className="flex flex-col divide-y rounded-xl border bg-surface">
            {POWERS.filter((power) => grant.powers.includes(power)).map((power) => (
              <li key={power} className="flex items-center gap-2 px-4 py-2.5">
                <CheckCircleIcon weight="fill" className="size-5 text-success-500" aria-hidden />
                <span className="type-body-sm-regular text-fg-heading">
                  {powerInfo[power].name}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-1.5">
            <p className="type-caption text-fg-caption">
              {[accessLine(grant, now), pending ? requestExpiry(grant, now) : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {pending && (
              <p className="flex items-center gap-1.5 type-caption text-fg-caption">
                <ShieldCheckIcon className="size-4" aria-hidden />
                Only accept if you know and trust this person.
              </p>
            )}
          </div>
        </div>
        <footer className="flex gap-3 px-6 pb-6 *:h-11 *:flex-1">
          {pending ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="type-heading-sm"
                disabled={act.isPending}
                onClick={() => run("decline", "Request declined")}
              >
                Decline
              </Button>
              <Button
                type="button"
                className="type-heading-sm"
                loading={act.isPending && act.variables?.action === "accept"}
                disabled={act.isPending}
                onClick={() => run("accept", `You’re now ${person.firstName}’s proxy`)}
              >
                Accept
              </Button>
            </>
          ) : (
            <>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="type-heading-sm">
                  Close
                </Button>
              </DialogClose>
              <Button
                type="button"
                variant="outline"
                className="border-error-500 type-heading-sm text-error-500 hover:bg-error-100 hover:text-error-500"
                loading={act.isPending}
                onClick={() => run("end", `You no longer have access for ${person.firstName}`)}
              >
                Stop access
              </Button>
            </>
          )}
        </footer>
      </DialogContent>
    </Dialog>
  );
}
