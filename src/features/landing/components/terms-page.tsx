import { Link } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoPage, LegalSections } from "@/features/landing/components/info-page";
import { hospitalTerms, patientTerms } from "@/features/landing/content/legal";

const audiences = { patient: patientTerms, hospital: hospitalTerms } as const;
type Audience = keyof typeof audiences;

/** The Terms and Conditions: the patients' and the hospitals', a tab each. */
export function TermsPage({
  audience,
  onAudienceChange,
}: {
  audience: Audience;
  onAudienceChange: (audience: Audience) => void;
}) {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms & Conditions"
      lead="The terms for patients using DocuHealth, and for the hospitals that care for them."
    >
      <Tabs
        value={audience}
        onValueChange={(next) => onAudienceChange(next as Audience)}
        className="gap-8"
      >
        <TabsList>
          <TabsTrigger value="patient">Patient</TabsTrigger>
          <TabsTrigger value="hospital">Hospital</TabsTrigger>
        </TabsList>
        {(Object.keys(audiences) as Audience[]).map((value) => {
          const document = audiences[value];
          return (
            <TabsContent key={value} value={value} className="flex flex-col gap-10">
              <div className="flex flex-col gap-2">
                <h2 className="type-title-xl text-fg-heading">{document.title}</h2>
                <p className="type-body text-fg-body">{document.intro.join(" ")}</p>
              </div>
              <LegalSections document={document} />
            </TabsContent>
          );
        })}
      </Tabs>
      <aside className="flex flex-col gap-2 rounded-xl border bg-card p-6">
        <h2 className="type-title-sm text-fg-heading">Integrating with the DocuHealth API?</h2>
        <p className="type-body text-fg-body">
          If you’re a developer or an EMR system integrating our After Visit Summary (AVS) API,
          please read{" "}
          <Link
            to="/api-terms-and-conditions"
            className="text-primary underline underline-offset-2"
          >
            the API terms
          </Link>
          .
        </p>
      </aside>
    </InfoPage>
  );
}
