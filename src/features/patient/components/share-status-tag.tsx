import { Tag } from "@/features/patient/components/tag";
import type { ShareStatus } from "@/features/patient/lib/sharing";

const tags = {
  active: { tone: "success", label: "Active" },
  expiring: { tone: "warning", label: "Expires soon" },
  ended: { tone: "neutral", label: "Ended" },
} as const;

/** "Active", "Expires soon" or "Ended". */
export function ShareStatusTag({ status }: { status: ShareStatus }) {
  return <Tag tone={tags[status].tone}>{tags[status].label}</Tag>;
}
