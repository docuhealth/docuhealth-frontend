import { createFileRoute } from "@tanstack/react-router";
import { ResultValueDetails } from "@/features/patient/components/result-value-details";

export const Route = createFileRoute("/patient/health/results/$resultId/$valueId")({
  component: Page,
});

function Page() {
  const { resultId, valueId } = Route.useParams();
  return <ResultValueDetails resultId={resultId} valueId={valueId} />;
}
