import { CaretRightIcon } from "@phosphor-icons/react";
import acpnImage from "@/assets/images/acpn.png";
import cacImage from "@/assets/images/cac.png";
import hospPharmImage from "@/assets/images/hosp-pharm.png";
import { LandingContainer } from "@/features/landing/components/landing-container";
import { SectionHeading } from "@/features/landing/components/section-heading";

const articles = [
  {
    image: acpnImage,
    alt: "ACPN Osun State chapter endorsement document",
    date: "Oct 30, 2025",
    title: "ACPN (Osun State chapter) endorsement",
    description:
      "Endorsed by the Association of Community Pharmacists of Nigeria, Osun State chapter.",
    href: "#",
  },
  {
    image: cacImage,
    alt: "Corporate Affairs Commission Certificate of Incorporation",
    date: "Oct 30, 2025",
    title: "Corporate Affairs Commission (CAC) certification",
    description: "Certified by the Corporate Affairs Commission of Nigeria.",
    href: "#",
  },
  {
    image: hospPharmImage,
    alt: "Healthcare workers deployed in hospitals and pharmacies",
    date: "Oct 30, 2025",
    title: "Deployed in hospitals and pharmacies",
    description: "Streamlining medical data exchange across Nigerian hospitals and pharmacies.",
    href: "#",
  },
] as const;

export function NewsUpdatesSection() {
  return (
    <LandingContainer id="news" className="pt-20 lg:pt-40">
      <SectionHeading
        title={
          <>
            Latest DocuHealth <br />
            <strong>News & Updates</strong>
          </>
        }
        description="Stay informed about DocuHealth platform updates and health information."
        descriptionClassName="max-w-110"
      />

      <div className="mt-11 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <article key={article.title} className="flex flex-col rounded-lg bg-card p-4 shadow-card">
            <img
              src={article.image}
              alt={article.alt}
              width={376}
              height={212}
              className="mx-auto rounded-t-md"
            />

            <p className="mt-6 type-body-sm-medium text-fg-caption">{article.date}</p>
            <h3 className="mt-2 truncate type-title-sm text-fg-heading">{article.title}</h3>
            <p className="mt-2.5 type-body-tight text-fg-body">{article.description}</p>

            <a
              href={article.href}
              className="mt-auto inline-flex items-center gap-2.5 pt-6 type-body-sm-tight-semibold text-primary hover:underline"
            >
              Read More
              <CaretRightIcon className="size-3.5" />
            </a>
          </article>
        ))}
      </div>
    </LandingContainer>
  );
}
