import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";

// TODO(design): build this page once it's designed.
export const Route = createFileRoute("/hospital/radiologist/help")({
  component: HelpPage,
});

function HelpPage() {
  return <SectionPlaceholder title="Help & Support" />;
}
