import { Tag } from "@/features/patient/components/tag";

/** A condition list row's state: Active in red, Resolved in green. */
export function ConditionStatusTag({ active }: { active: boolean }) {
  if (!active) return <Tag tone="success">Resolved</Tag>;
  // Tag has no red tone; the same shape on the error tint.
  return (
    <span className="rounded-md bg-error-100 px-2 py-0.5 type-caption-semibold text-error-700">
      Active
    </span>
  );
}
