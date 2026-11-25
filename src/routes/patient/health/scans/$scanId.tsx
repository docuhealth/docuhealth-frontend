import { createFileRoute } from "@tanstack/react-router";
import { ScanDetails } from "@/features/patient/components/condition-pages";

export const Route = createFileRoute("/patient/health/scans/$scanId")({
  component: Page,
});

function Page() {
  const { scanId } = Route.useParams();
  return <ScanDetails scanId={scanId} />;
}
