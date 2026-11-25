import { createFileRoute } from "@tanstack/react-router";
import { ScanResultsPage } from "@/features/patient/components/condition-pages";

export const Route = createFileRoute("/patient/health/scans/")({
  component: Page,
});

function Page() {
  return <ScanResultsPage />;
}
