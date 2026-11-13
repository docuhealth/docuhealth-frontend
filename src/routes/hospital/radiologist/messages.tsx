import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";

// TODO(design): build this page once it's designed.
export const Route = createFileRoute("/hospital/radiologist/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  return <SectionPlaceholder title="Messages" />;
}
