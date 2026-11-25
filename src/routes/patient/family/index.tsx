import { createFileRoute } from "@tanstack/react-router";
import { FamilyPage } from "@/features/patient/components/family-page";

export const Route = createFileRoute("/patient/family/")({
  component: Page,
});

function Page() {
  return <FamilyPage />;
}
