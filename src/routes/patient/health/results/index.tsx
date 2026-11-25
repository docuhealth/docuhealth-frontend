import { createFileRoute } from "@tanstack/react-router";
import { TestResultsPage } from "@/features/patient/components/test-results-page";

export const Route = createFileRoute("/patient/health/results/")({
  component: Page,
});

function Page() {
  return <TestResultsPage />;
}
