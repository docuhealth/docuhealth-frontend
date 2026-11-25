import { createFileRoute } from "@tanstack/react-router";
import { VisitSummaryPage } from "@/features/patient/components/visit-pages";

export const Route = createFileRoute("/patient/health/visits/$visitId")({
  component: Page,
});

function Page() {
  const { visitId } = Route.useParams();
  return <VisitSummaryPage visitId={visitId} />;
}
