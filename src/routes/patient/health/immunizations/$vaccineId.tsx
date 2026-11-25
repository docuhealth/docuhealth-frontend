import { createFileRoute } from "@tanstack/react-router";
import { ImmunizationDetails } from "@/features/patient/components/immunization-details";

export const Route = createFileRoute("/patient/health/immunizations/$vaccineId")({
  component: Page,
});

function Page() {
  const { vaccineId } = Route.useParams();
  return <ImmunizationDetails vaccineId={vaccineId} />;
}
