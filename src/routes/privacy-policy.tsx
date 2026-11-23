import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, LegalSections } from "@/features/landing/components/info-page";
import { privacyPolicy } from "@/features/landing/content/legal";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title={privacyPolicy.title}
      lead={privacyPolicy.intro.length > 0 ? privacyPolicy.intro.join(" ") : undefined}
    >
      <LegalSections document={privacyPolicy} />
    </InfoPage>
  );
}
