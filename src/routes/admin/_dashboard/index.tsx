import { createFileRoute } from "@tanstack/react-router";
import { DhAdminOverview } from "@/features/dh-admin/components/dh-admin-overview";

export const Route = createFileRoute("/admin/_dashboard/")({
  component: OverviewPage,
});

function OverviewPage() {
  return (
    <>
      <title>Overview · DocuHealth admin</title>
      <DhAdminOverview />
    </>
  );
}
