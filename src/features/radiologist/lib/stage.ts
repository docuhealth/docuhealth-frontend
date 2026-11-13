import type { ScanStage } from "@/features/radiologist/api/schemas";

/** Each stage's color, shared by its pill and the order page's status card. */
export const stageTones = {
  pending: "warning",
  in_progress: "info",
  completed: "success",
  rejected: "error",
} as const satisfies Record<ScanStage, "warning" | "info" | "success" | "error">;

/** Where an order stands, in a word. */
export const stageStatusLabels = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  rejected: "Rejected",
} as const satisfies Record<ScanStage, string>;
