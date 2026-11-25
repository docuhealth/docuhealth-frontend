import { CheckIcon } from "@phosphor-icons/react";
import type { ProgressStep } from "@/features/patient/lib/scans";
import { cn } from "@/lib/utils";

/** A vertical stepper: done steps ticked in green, the current one ringed, the rest grey. */
export function ScanProgressSteps({ steps }: { steps: ProgressStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        return (
          <li
            key={step.label}
            aria-current={step.state === "current" ? "step" : undefined}
            className="flex gap-3"
          >
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-0.5 grid size-4 shrink-0 place-content-center rounded-full",
                  step.state === "done" && "bg-success-500 text-white",
                  step.state === "current" && "border-2 border-primary bg-card",
                  step.state === "pending" && "border border-line bg-card",
                )}
              >
                {step.state === "done" && <CheckIcon weight="bold" className="size-2.5" />}
                {step.state === "current" && <span className="size-1.5 rounded-full bg-primary" />}
              </span>
              {!last && (
                <span
                  aria-hidden
                  className={cn(
                    "my-1 w-0.5 flex-1 rounded-full",
                    step.state === "done" ? "bg-success-500" : "bg-line",
                  )}
                />
              )}
            </div>
            <div className={cn("flex flex-1 flex-col gap-0.5", !last && "mb-3 border-b pb-3")}>
              <p
                className={cn(
                  "type-body-sm-medium",
                  step.state === "pending" ? "text-fg-caption" : "text-fg-heading",
                )}
              >
                {step.label}
                <span className="sr-only">
                  {step.state === "done" ? " (done)" : step.state === "current" ? " (now)" : ""}
                </span>
              </p>
              {step.detail && <p className="type-caption text-fg-caption">{step.detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
