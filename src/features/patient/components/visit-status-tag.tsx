import { Tag } from "@/features/patient/components/tag";
import type { VisitStatus } from "@/features/patient/lib/visits";

/** A visit row's tag: Booked, Summary, No summary, Admitted or Discharged. */
export function VisitStatusTag({ status }: { status: VisitStatus }) {
  switch (status) {
    case "booked":
      return <Tag tone="info">Booked</Tag>;
    case "summary":
      return <Tag tone="brand">Summary</Tag>;
    case "no-summary":
      return <Tag tone="neutral">No summary</Tag>;
    case "admitted":
      return <Tag tone="warning">Admitted</Tag>;
    case "discharged":
      return <Tag tone="success">Discharged</Tag>;
  }
}
