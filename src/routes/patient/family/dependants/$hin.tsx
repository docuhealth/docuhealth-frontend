import { createFileRoute } from "@tanstack/react-router";
import { DependantDetails } from "@/features/patient/components/dependant-details";

export const Route = createFileRoute("/patient/family/dependants/$hin")({
  component: Page,
});

function Page() {
  const { hin } = Route.useParams();
  return <DependantDetails hin={hin} />;
}
