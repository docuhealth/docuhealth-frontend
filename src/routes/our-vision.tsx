import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, Prose } from "@/features/landing/components/info-page";
import { vision } from "@/features/landing/content/pages";

export const Route = createFileRoute("/our-vision")({
  component: VisionPage,
});

function VisionPage() {
  return (
    <InfoPage eyebrow="About DocuHealth" title={vision.title} lead={vision.lead}>
      <Prose blocks={vision.body} />
    </InfoPage>
  );
}
