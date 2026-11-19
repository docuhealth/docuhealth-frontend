import type { ReactNode } from "react";
import {
  type ResultFlag,
  resultFlagLabels,
  type TestRecord,
  testProgressLabels,
  type TestStage,
} from "@/features/lab-scientist/api/schemas";
import { stageStatusLabels, stageTones } from "@/features/lab-scientist/lib/stage";
import { formatShortTimeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const tones = {
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-700",
  error: "bg-error-100 text-error-700",
  info: "bg-info-100 text-info-500",
  neutral: "bg-line text-fg-caption",
};

/** A short status as a small tinted pill; `dot` leads it with a dot in the same color. */
function Tag({
  tone,
  dot,
  children,
}: {
  tone: keyof typeof tones;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 type-caption-medium whitespace-nowrap",
        tones[tone],
      )}
    >
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/**
 * Where a test order stands: a pending (or rejected) one is "New" until the lab opens it, then
 * shows how long ago it came in ("3d ago"); one in progress says why it's under way ("Appt").
 */
export function TestStatusTag({ record, now }: { record: TestRecord; now: Date }) {
  switch (record.stage) {
    case "pending":
    case "rejected":
      return record.seen ? (
        <Tag tone="neutral">{formatShortTimeAgo(new Date(record.requestedAt), now)}</Tag>
      ) : (
        <Tag tone="success">New</Tag>
      );
    case "in_progress":
      return (
        <Tag tone="warning">
          {record.progress ? testProgressLabels[record.progress] : "In progress"}
        </Tag>
      );
    case "completed":
      return <Tag tone="success">Completed</Tag>;
  }
}

/** Where an order stands, in a word. */
export function TestStageTag({ stage }: { stage: TestStage }) {
  return <Tag tone={stageTones[stage]}>{stageStatusLabels[stage]}</Tag>;
}

/** A result waiting for approval. */
export function PendingTag() {
  return <Tag tone="warning">Pending</Tag>;
}

const flagTones = {
  normal: "success",
  low: "warning",
  high: "warning",
  critical_low: "error",
  critical_high: "error",
} as const satisfies Record<ResultFlag, keyof typeof tones>;

/** How a result compares with its reference range; `range` words a normal one "Normal range". */
export function FlagTag({ flag, range }: { flag: ResultFlag; range?: boolean }) {
  return (
    <Tag tone={flagTones[flag]} dot={!range}>
      {range && flag === "normal" ? "Normal range" : resultFlagLabels[flag]}
    </Tag>
  );
}
