import { createFileRoute } from "@tanstack/react-router";
import { AuditLogs } from "@/features/audit-logs/components/audit-logs";

export const Route = createFileRoute("/hospital/admin/audit-logs")({
  component: AuditLogsPage,
});

function AuditLogsPage() {
  return (
    <>
      <title>Audit logs · DocuHealth</title>
      <AuditLogs description="Who downloaded lab results and scan reports in your hospital, and when." />
    </>
  );
}
