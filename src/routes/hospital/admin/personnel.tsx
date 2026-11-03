import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";

// TODO(design): build this page once it's designed.
export const Route = createFileRoute("/hospital/admin/personnel")({
  component: PersonnelPage,
});

function PersonnelPage() {
  return <SectionPlaceholder title="Health personnel" />;
}
