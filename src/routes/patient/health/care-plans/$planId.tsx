import { createFileRoute } from "@tanstack/react-router";
import { CarePlanDetails } from "@/features/patient/components/care-plan-details";

export const Route = createFileRoute("/patient/health/care-plans/$planId")({
  component: Page,
});

function Page() {
  const { planId } = Route.useParams();
  return <CarePlanDetails planId={planId} />;
}
