import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, Prose } from "@/features/landing/components/info-page";
import { mission } from "@/features/landing/content/pages";

export const Route = createFileRoute("/our-mission")({
  component: MissionPage,
});

function MissionPage() {
  return (
    <InfoPage eyebrow="About DocuHealth" title={mission.title} lead={mission.lead}>
      <Prose blocks={mission.body} />
    </InfoPage>
  );
}
