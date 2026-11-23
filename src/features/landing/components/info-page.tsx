import type { ReactNode } from "react";
import { Footer } from "@/features/landing/components/footer";
import { LandingContainer } from "@/features/landing/components/landing-container";
import { Navbar } from "@/features/landing/components/navbar";
import type { Block, LegalDocument } from "@/features/landing/content/legal";

/**
 * A page of the public site beyond the home page (Mission, News, Privacy…): the landing navbar,
 * a header with the title and `lead`, the page's `children` in a readable measure, the footer.
 */
export function InfoPage({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    // The design sets Inter at its default optical size at every text size.
    <div className="[font-optical-sizing:none]">
      <Navbar />
      <main>
        <title>{`${title} · DocuHealth`}</title>
        <header className="border-b border-line bg-card">
          <LandingContainer className="flex flex-col gap-4 py-14 lg:py-20">
            {eyebrow && <p className="type-caption-medium text-primary uppercase">{eyebrow}</p>}
            <h1 className="max-w-200 type-section text-fg-heading">{title}</h1>
            {lead && <div className="max-w-200 type-lead text-fg-body">{lead}</div>}
          </LandingContainer>
        </header>
        <LandingContainer className="py-12 lg:py-20">
          <div className="flex max-w-200 flex-col gap-10">{children}</div>
        </LandingContainer>
      </main>
      <Footer />
    </div>
  );
}

/** Paragraphs, and lists as bullets. */
export function Prose({ blocks }: { blocks: readonly Block[] }) {
  return (
    <div className="flex flex-col gap-4 type-body text-fg-body">
      {blocks.map((block, index) =>
        typeof block === "string" ? (
          <p key={index}>{block}</p>
        ) : (
          <ul key={index} className="flex list-disc flex-col gap-2 pl-6 marker:text-primary">
            {block.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

/** A legal document's numbered sections (its intro goes in the page's lead). */
export function LegalSections({ document }: { document: LegalDocument }) {
  return (
    <>
      {document.sections.map((section, index) => (
        <section key={section.heading || index} className="flex flex-col gap-4">
          {section.heading && <h2 className="type-title-sm text-fg-heading">{section.heading}</h2>}
          <Prose blocks={section.body} />
        </section>
      ))}
    </>
  );
}
