import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/features/patient/components/coming-soon-page";

export const Route = createFileRoute("/patient/messages")({
  component: Page,
});

function Page() {
  return <ComingSoonPage title="Messages" />;
}
