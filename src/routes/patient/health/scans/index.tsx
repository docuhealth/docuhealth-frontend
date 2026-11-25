import { createFileRoute } from "@tanstack/react-router";
import { ScanResultsPage } from "@/features/patient/components/scan-results-page";

export const Route = createFileRoute("/patient/health/scans/")({
  component: Page,
});

function Page() {
  return <ScanResultsPage />;
}
