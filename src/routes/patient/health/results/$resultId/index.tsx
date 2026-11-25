import { createFileRoute } from "@tanstack/react-router";
import { LabTestDetails } from "@/features/patient/components/lab-test-details";

export const Route = createFileRoute("/patient/health/results/$resultId/")({
  component: Page,
});

function Page() {
  const { resultId } = Route.useParams();
  return <LabTestDetails resultId={resultId} />;
}
