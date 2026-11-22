import { createFileRoute } from "@tanstack/react-router";
import { AuditLogs } from "@/features/audit-logs/components/audit-logs";

// The lab admin's (the sidebar shows it only to them).
export const Route = createFileRoute("/hospital/lab-scientist/audit-logs")({
  component: AuditLogsPage,
});

function AuditLogsPage() {
  return (
    <>
      <title>Audit logs · DocuHealth</title>
      <AuditLogs description="Who downloaded your lab’s results and scan reports, and when." />
    </>
  );
}
