import { createFileRoute } from "@tanstack/react-router";
import { TimelinePage } from "@/features/patient/components/timeline-page";

export const Route = createFileRoute("/patient/health/timeline")({
  component: Page,
});

function Page() {
  return <TimelinePage />;
}
