import { BuildingsIcon, CaretRightIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { type FacilityOwing, formatBalance } from "@/features/patient/lib/bills";
import { formatDayMonth } from "@/lib/format";

/**
 * The brand-coloured card at the top of Bills & payments: what's owed to one facility, with a
 * Pay button to its bill, or (`owing` null) that the patient is all paid up.
 */
export function OutstandingCard({ owing, label }: { owing: FacilityOwing | null; label: string }) {
  return (
    <div className="relative flex min-h-34 flex-col gap-1 overflow-hidden rounded-xl bg-primary p-5 text-primary-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_50%,rgb(255_255_255/0.22),transparent_35%)]"
      />
      <div className="relative flex items-start justify-between gap-4">
        <p className="type-caption-medium tracking-wide text-white/80 uppercase">{label}</p>
        {owing ? (
          owing.dueAt && (
            <span className="rounded-full bg-warning-300 px-2.5 py-0.5 type-caption-semibold text-fg-heading">
              Due {formatDayMonth(new Date(owing.dueAt))}
            </span>
          )
        ) : (
          <span className="rounded-full bg-success-100 px-2.5 py-0.5 type-caption-semibold text-success-700">
            Up to date
          </span>
        )}
      </div>
      <p className="relative type-accent-h1 text-white">{formatBalance(owing?.amount ?? 0)}</p>
      <div className="relative flex items-end justify-between gap-4">
        <p className="flex items-center gap-1.5 type-caption text-white/85">
          {owing ? (
            <>
              <BuildingsIcon aria-hidden className="size-4" />
              To {owing.facility}
            </>
          ) : (
            <>
              <CheckCircleIcon aria-hidden className="size-4" />
              You’re all paid up
            </>
          )}
        </p>
        {owing && (
          <Button
            asChild
            variant="outline"
            className="h-8 border-white/40 bg-white/10 px-3 type-caption-medium text-white hover:bg-white/20 hover:text-white"
          >
            <Link
              to="/patient/bills/$billId"
              params={{ billId: owing.billId }}
              aria-label={`Pay ${owing.facility}`}
            >
              Pay
              <CaretRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
