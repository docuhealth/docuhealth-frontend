import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/features/patient/components/coming-soon-page";

export const Route = createFileRoute("/patient/personnel")({
  component: Page,
});

function Page() {
  return <ComingSoonPage title="Health personnel" />;
}
