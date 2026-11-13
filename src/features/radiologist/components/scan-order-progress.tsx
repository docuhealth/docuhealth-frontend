import type { ReactNode } from "react";
import type { ScanOrder } from "@/features/radiologist/api/schemas";
import { AlertMarkIcon, CancelIcon, TickIcon } from "@/features/radiologist/components/icons";
import { ScanStageTag } from "@/features/radiologist/components/status-tag";
import { formatDateCommaTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type StepState = "done" | "current" | "rejected" | "upcoming" | "skipped";

type Step = { title: string; detail: string; state: StepState };

const stateLabels = {
  done: "Done",
  current: "Current step",
  rejected: "Rejected",
  upcoming: "Not yet",
  skipped: "Skipped",
} as const satisfies Record<StepState, string>;

/** The order's steps so far and still to come. A completed order shows its report instead. */
function stepsFor(order: ScanOrder): Step[] {
  const received: Step = {
    title: "Request received",
    detail: `${formatDateCommaTime(new Date(order.requestedAt))} · ${order.requestedBy}`,
    state: "done",
  };
  const notUploaded = "Not uploaded yet";

  switch (order.stage) {
    case "pending":
      return [
        received,
        {
          title: "Waiting for you to accept",
          detail: "Accept to schedule the scan, or reject with a reason",
          state: "current",
        },
        { title: "Imaging done", detail: "After you accept", state: "upcoming" },
        { title: "Result uploaded", detail: notUploaded, state: "upcoming" },
      ];
    case "rejected":
      return [
        received,
        {
          title: "Request rejected",
          detail: order.rejection
            ? `${formatDateCommaTime(new Date(order.rejection.at))} · by radiology`
            : "By radiology",
          state: "rejected",
        },
        { title: "Imaging done", detail: "Not started", state: "skipped" },
        { title: "Result uploaded", detail: notUploaded, state: "skipped" },
      ];
    default:
      return [
        received,
        {
          title: "Request accepted",
          detail: order.acceptedAt ? formatDateCommaTime(new Date(order.acceptedAt)) : "",
          state: "done",
        },
        {
          title: "Imaging in progress",
          detail: "Upload the report when it is ready",
          state: order.stage === "completed" ? "done" : "current",
        },
        {
          title: "Result uploaded",
          detail: order.result
            ? formatDateCommaTime(new Date(order.result.uploadedAt))
            : notUploaded,
          state: order.result ? "done" : "upcoming",
        },
      ];
  }
}

/** "Where this test is now": a timeline of the order's steps. */
export function ScanOrderProgress({ order, className }: { order: ScanOrder; className?: string }) {
  const steps = stepsFor(order);
  // The current step takes the stage's color: amber while waiting on you, blue once under way.
  const current = order.stage === "pending" ? "warning" : "info";

  return (
    <section
      aria-labelledby="scan-order-progress"
      className={cn("flex flex-col gap-6 rounded-xl border bg-card p-4 sm:p-5", className)}
    >
      <header className="flex items-start justify-between gap-3 border-b pb-4">
        <div className="flex flex-col gap-0.5">
          <h2 id="scan-order-progress" className="type-body-sm-tight-semibold text-fg-heading">
            Progress
          </h2>
          <p className="type-body-sm-regular text-fg-caption">Where this test is now.</p>
        </div>
        <ScanStageTag stage={order.stage} />
      </header>

      <ol className="flex flex-col">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-9 bottom-1 left-3.5 w-0.5 -translate-x-1/2 rounded-full",
                  step.state === "done" ? "bg-success-500" : "bg-divider",
                )}
              />
            )}
            <StepMarker state={step.state} tone={current} />
            <div className="flex min-w-0 flex-col gap-0.5">
              <p
                className={cn(
                  "type-body-sm-tight-semibold",
                  step.state === "skipped" ? "text-fg-caption" : "text-fg-heading",
                )}
              >
                {step.title}
                <span className="sr-only">, {stateLabels[step.state]}</span>
              </p>
              {step.detail && (
                <p
                  className={cn(
                    "type-body-sm-regular text-fg-caption",
                    step.state === "skipped" && "opacity-60",
                  )}
                >
                  {step.detail}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StepMarker({ state, tone }: { state: StepState; tone: "warning" | "info" }) {
  let marker: ReactNode;
  switch (state) {
    case "done":
      marker = (
        <span className="grid size-7 place-content-center rounded-full bg-success-500 text-white">
          <TickIcon className="size-4" strokeWidth={2.5} />
        </span>
      );
      break;
    case "rejected":
      marker = (
        <span className="grid size-7 place-content-center rounded-full bg-error-500 text-white">
          <CancelIcon className="size-4" strokeWidth={2.5} />
        </span>
      );
      break;
    case "current":
      marker = (
        <span
          className={cn(
            "grid size-7 place-content-center rounded-full border-2",
            tone === "warning" ? "border-warning-500" : "border-info-500",
          )}
        >
          <span
            className={cn(
              "size-3 rounded-full",
              tone === "warning" ? "bg-warning-500" : "bg-info-500",
            )}
          />
        </span>
      );
      break;
    default:
      marker = <span className="block size-7 rounded-full border-2 border-dashed border-divider" />;
  }
  return (
    <span aria-hidden className="block shrink-0">
      {marker}
    </span>
  );
}

/** Why the order was turned down, in red under its progress. */
export function RejectionReason({ reason }: { reason: string }) {
  return (
    <section
      aria-labelledby="rejection-reason"
      className="flex flex-col gap-3 rounded-xl border border-error-100 bg-error-100/60 p-4 sm:p-5"
    >
      <h2 id="rejection-reason" className="flex items-center gap-2 type-label text-error-700">
        <span
          aria-hidden
          className="grid size-5 place-content-center rounded-full bg-error-700 text-white"
        >
          <AlertMarkIcon className="size-3.5" />
        </span>
        Reason for rejection
      </h2>
      <p className="type-body-sm-regular text-error-700">{reason}</p>
    </section>
  );
}
