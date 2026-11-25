import { createFileRoute } from "@tanstack/react-router";
import { ConditionDetails } from "@/features/patient/components/condition-details";

export const Route = createFileRoute("/patient/health/conditions/$conditionId")({
  component: Page,
});

function Page() {
  const { conditionId } = Route.useParams();
  return <ConditionDetails conditionId={conditionId} />;
}
