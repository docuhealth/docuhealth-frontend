import { createFileRoute } from "@tanstack/react-router";
import { ApiDetails } from "@/features/landing/components/api-details";
import { InfoPage } from "@/features/landing/components/info-page";
import { api } from "@/features/landing/content/pages";

export const Route = createFileRoute("/docuhealth-api")({
  component: ApiPage,
});

function ApiPage() {
  return (
    <InfoPage eyebrow="For developers" title={api.title} lead={api.lead}>
      <ApiDetails />
    </InfoPage>
  );
}
