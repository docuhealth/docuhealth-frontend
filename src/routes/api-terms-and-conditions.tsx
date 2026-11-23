import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, LegalSections } from "@/features/landing/components/info-page";
import { apiTerms } from "@/features/landing/content/legal";

export const Route = createFileRoute("/api-terms-and-conditions")({
  component: ApiTermsPage,
});

function ApiTermsPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title={apiTerms.title}
      lead={apiTerms.intro.length > 0 ? apiTerms.intro.join(" ") : undefined}
    >
      <LegalSections document={apiTerms} />
    </InfoPage>
  );
}
