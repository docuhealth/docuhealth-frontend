import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

/** "Share your record securely", with the button that starts a share. */
export function SharingBanner({ onShare }: { onShare: () => void }) {
  return (
    <section
      aria-labelledby="sharing-banner-title"
      className="flex flex-col gap-4 rounded-xl bg-primary bg-[radial-gradient(circle_at_85%_50%,color-mix(in_oklch,var(--brand),white_18%),transparent_50%)] px-6 py-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-1.5">
        <h2 id="sharing-banner-title" className="type-h3">
          Share your record securely
        </h2>
        <p className="type-body-sm-regular text-primary-foreground/80">
          Give a doctor or facility time-limited access to the parts of your record you choose. You
          can stop sharing at any time.
        </p>
      </div>
      <Button
        onClick={onShare}
        className="h-11 shrink-0 bg-card px-5 type-heading-sm text-primary hover:bg-brand-50 active:bg-brand-50"
      >
        <PlusIcon data-icon="inline-start" />
        Share my record
      </Button>
    </section>
  );
}
