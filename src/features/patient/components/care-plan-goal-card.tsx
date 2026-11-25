import { TargetIcon } from "@phosphor-icons/react";
import type { CarePlan } from "@/features/patient/api/pending";
import { Tag } from "@/features/patient/components/tag";
import { goalLatest } from "@/features/patient/lib/care-plans";

/** "Your goal": the target the plan works towards, the latest reading, and whether it's on track. */
export function CarePlanGoalCard({ goal }: { goal: NonNullable<CarePlan["goal"]> }) {
  const latest = goalLatest(goal);
  return (
    <section aria-label="Your goal" className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <span className="inline-flex w-fit items-center gap-1 rounded-md bg-error-500 px-2 py-0.5 type-caption-semibold text-white [&_svg]:size-3.5">
        <TargetIcon aria-hidden />
        Your goal
      </span>
      <div className="flex flex-col gap-1 border-t pt-3">
        <p className="flex items-baseline gap-1">
          <span className="type-title text-fg-heading">{goal.target}</span>
          <span className="type-caption text-fg-caption">{goal.unit}</span>
        </p>
        <div className="flex items-center justify-between gap-3">
          <p className="type-caption text-fg-caption">{latest ?? "No reading yet"}</p>
          {latest && (
            <Tag tone={goal.onTrack ? "success" : "warning"}>
              {goal.onTrack ? "On track" : "Off track"}
            </Tag>
          )}
        </div>
      </div>
    </section>
  );
}
