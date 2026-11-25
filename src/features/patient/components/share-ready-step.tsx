import { CheckIcon, CopyIcon, LinkIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { ReadyShare } from "@/features/patient/api/pending-sharing";
import { SectionLabel } from "@/features/patient/components/patient-ui";
import { ShareCopyButton } from "@/features/patient/components/share-copy-button";
import { formatAccessCode, formatExpiry } from "@/features/patient/lib/sharing";

/** Sharing, done: the access code to pass on (or the link), and a way to take it back. */
export function ShareReadyStep({ ready, onStop }: { ready: ReadyShare; onStop: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="relative flex flex-col items-center gap-3 px-6 pt-6 text-center">
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="absolute top-5 right-6 rounded-full bg-line hover:bg-divider"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
        <span className="grid size-16 place-content-center rounded-full bg-success-100">
          <span className="grid size-11 place-content-center rounded-full bg-success-500 text-white">
            <CheckIcon weight="bold" className="size-6" />
          </span>
        </span>
        <DialogTitle className="type-h4 text-fg-heading">Record is ready to share</DialogTitle>
        <DialogDescription className="max-w-80 type-body-sm-regular text-fg-caption">
          Give {ready.share.recipient.name} this code or send the secure link. Access expires on{" "}
          <span className="type-body-sm-medium text-fg-heading">
            {formatExpiry(ready.share.expiresAt)}
          </span>
          .
        </DialogDescription>
      </header>

      <div className="flex flex-col gap-4 px-6 py-5">
        <section
          aria-label="Access code"
          className="flex flex-col items-center gap-2 rounded-xl border bg-surface px-4 py-5"
        >
          <SectionLabel>Access code</SectionLabel>
          <p className="type-accent-h2 tracking-wider text-fg-heading">
            {formatAccessCode(ready.accessCode)}
          </p>
          <div className="flex flex-wrap justify-center gap-1">
            <ShareCopyButton
              text={ready.accessCode}
              label="Copy code"
              copiedMessage="Access code copied"
              icon={CopyIcon}
            />
            <ShareCopyButton
              text={ready.link}
              label="Copy link"
              copiedMessage="Secure link copied"
              icon={LinkIcon}
            />
          </div>
        </section>
      </div>

      <footer className="flex gap-3 px-6 pb-6 *:h-11 *:flex-1">
        <Button
          type="button"
          variant="outline"
          onClick={onStop}
          className="border-error-500 type-heading-sm text-error-500 hover:bg-error-100 hover:text-error-500"
        >
          Stop sharing
        </Button>
        <DialogClose asChild>
          <Button type="button" className="type-heading-sm">
            Done
          </Button>
        </DialogClose>
      </footer>
    </div>
  );
}
