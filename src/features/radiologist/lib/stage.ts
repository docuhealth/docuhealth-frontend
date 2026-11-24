import type { ScanOrder, ScanStage } from "@/features/radiologist/api/schemas";
import { pdfFileName } from "@/lib/export-element";

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

/**
 * Why the order's report can't be printed or downloaded; `null` when it can. As in v1, only a
 * completed scan's report can leave, never a pending, in-progress, image-collected or rejected
 * order's; nor a report the requesting doctor sent back.
 */
export function reportExportBlocker(order: ScanOrder): string | null {
  if (order.stage !== "completed" || !order.result) return "There’s no report to print yet.";
  if (order.result.status === "rejected") return "The doctor sent this report back.";
  return null;
}

/** The PDF's name: patient, scan and hospital, e.g. "ada_obi_chest_x_ray_luth.pdf". */
export function reportFileName(order: ScanOrder) {
  return pdfFileName(
    order.patient.name,
    order.result?.examination || order.modality || "scan",
    order.provider.name,
  );
}
