import { Tag } from "@/features/patient/components/tag";
import type { AppointmentStatus } from "@/features/patient/lib/appointments";

/** "Confirmed", "Pending", "Cancelled" or "Completed" on its tint. */
export function AppointmentStatusTag({ status }: { status: AppointmentStatus }) {
  if (status === "cancelled") return <Tag tone="error">Cancelled</Tag>;
  if (status === "pending") return <Tag tone="warning">Pending</Tag>;
  if (status === "completed") return <Tag tone="neutral">Completed</Tag>;
  return <Tag tone="success">Confirmed</Tag>;
}
