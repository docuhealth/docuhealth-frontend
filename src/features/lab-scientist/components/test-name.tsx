import { TestTubeIcon } from "@phosphor-icons/react";
import type { LabTest } from "@/features/lab-scientist/api/schemas";

/** A test's name over its LOINC code, led by a tinted test-tube badge. */
export function TestName({ test }: { test: LabTest }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <TestTubeBadge />
      <div className="flex min-w-0 flex-col">
        <span className="truncate type-body-sm-regular text-fg-heading">{test.name}</span>
        <span className="type-caption text-fg-caption">LOINC {test.loinc}</span>
      </div>
    </div>
  );
}

/** The round lilac badge with a test tube in it, beside a test. */
export function TestTubeBadge() {
  return (
    <span
      aria-hidden
      className="grid size-8 shrink-0 place-content-center rounded-full bg-primary/10 text-primary"
    >
      <TestTubeIcon className="size-4" />
    </span>
  );
}
