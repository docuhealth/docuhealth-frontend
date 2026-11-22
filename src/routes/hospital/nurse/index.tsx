import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";

// TODO(v2 migration, phase 4): the overview comes in a later step.
export const Route = createFileRoute("/hospital/nurse/")({
  component: OverviewPage,
});

function OverviewPage() {
  return <SectionPlaceholder title="Overview" />;
}
