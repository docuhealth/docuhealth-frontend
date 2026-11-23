import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, LegalSections } from "@/features/landing/components/info-page";
import { legalNotice } from "@/features/landing/content/legal";

export const Route = createFileRoute("/legal-notice")({
  component: LegalNoticePage,
});

function LegalNoticePage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title={legalNotice.title}
      lead={legalNotice.intro.length > 0 ? legalNotice.intro.join(" ") : undefined}
    >
      <LegalSections document={legalNotice} />
    </InfoPage>
  );
}
