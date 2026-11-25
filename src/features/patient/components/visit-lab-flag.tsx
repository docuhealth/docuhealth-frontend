import type { LabResult } from "@/features/patient/api/pending";
import { Tag } from "@/features/patient/components/tag";

const labels = { normal: "Normal", low: "Low", high: "High" };

/** A lab value's flag as a tag: Normal in green, Low or High in amber. */
export function VisitLabFlag({ flag }: { flag: LabResult["values"][number]["flag"] }) {
  return <Tag tone={flag === "normal" ? "success" : "warning"}>{labels[flag]}</Tag>;
}
