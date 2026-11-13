import type { ReactNode } from "react";
import {
  type ScanRecord,
  scanProgressLabels,
  type ScanStage,
  type UploadStatus,
  uploadStatusLabels,
} from "@/features/radiologist/api/schemas";
import { stageStatusLabels, stageTones } from "@/features/radiologist/lib/stage";
import { formatShortTimeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const tones = {
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-700",
  error: "bg-error-100 text-error-700",
  info: "bg-info-100 text-info-500",
  neutral: "bg-line text-fg-caption",
};

/** A short status as a small tinted pill. */
function Tag({ tone, children }: { tone: keyof typeof tones; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-1 type-caption-medium whitespace-nowrap",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

const uploadTones = {
  successful: "success",
  processing: "warning",
  failed: "error",
} as const satisfies Record<UploadStatus, keyof typeof tones>;

/** Whether an uploaded result went through. */
export function UploadStatusTag({ status }: { status: UploadStatus }) {
  return <Tag tone={uploadTones[status]}>{uploadStatusLabels[status]}</Tag>;
}

/**
 * Where a scan order stands: a pending one is "New" until the radiologist opens it, then shows
 * how long it has waited ("3d ago"); one in progress says why it's under way ("Appt").
 */
export function ScanStatusTag({ record, now }: { record: ScanRecord; now: Date }) {
  switch (record.stage) {
    case "pending":
      return record.seen ? (
        <Tag tone="neutral">{formatShortTimeAgo(new Date(record.requestedAt), now)}</Tag>
      ) : (
        <Tag tone="success">New</Tag>
      );
    case "in_progress":
      return (
        <Tag tone="warning">
          {record.progress ? scanProgressLabels[record.progress] : "In progress"}
        </Tag>
      );
    case "completed":
      return <Tag tone="success">Completed</Tag>;
    case "rejected":
      return <Tag tone="error">Rejected</Tag>;
  }
}

/** Where an order stands, in a word. */
export function ScanStageTag({ stage }: { stage: ScanStage }) {
  return <Tag tone={stageTones[stage]}>{stageStatusLabels[stage]}</Tag>;
}
