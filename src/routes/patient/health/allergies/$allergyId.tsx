import { createFileRoute } from "@tanstack/react-router";
import { AllergyDetails } from "@/features/patient/components/allergy-details";

export const Route = createFileRoute("/patient/health/allergies/$allergyId")({
  component: Page,
});

function Page() {
  const { allergyId } = Route.useParams();
  return <AllergyDetails allergyId={allergyId} />;
}
