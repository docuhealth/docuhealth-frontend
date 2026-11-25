import { WarningCircleIcon } from "@phosphor-icons/react";

/** "That time is no longer free": someone booked the chosen time first. */
export function AppointmentConflictBanner({ time }: { time: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-error-500/20 bg-error-100 px-4 py-3"
    >
      <WarningCircleIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-error-500" />
      <div className="flex flex-col gap-0.5">
        <p className="type-body-sm-medium text-fg-heading">That time is no longer free</p>
        <p className="type-caption text-fg-body">
          Someone booked {time} while you were reviewing. Your details are saved. Just pick a new
          time.
        </p>
      </div>
    </div>
  );
}
