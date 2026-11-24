import { CaretRightIcon } from "@phosphor-icons/react";
import { LandingContainer } from "@/features/landing/components/landing-container";
import { LandingLink } from "@/features/landing/components/landing-link";
import { SectionHeading } from "@/features/landing/components/section-heading";
import { news } from "@/features/landing/content/pages";
import { RevealGroup, RevealItem } from "@/features/landing/components/motion";
import { liftOnHover } from "@/features/landing/lib/motion";
import { cn } from "@/lib/utils";

/** The news with a picture, for the cards. */
const articles = news.filter((article) => article.image);

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

      <RevealGroup className="mt-11 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <RevealItem
            as="article"
            key={article.slug}
            className={cn("flex flex-col rounded-lg bg-card p-4 shadow-card", liftOnHover)}
          >
            <img
              src={article.image?.src}
              alt={article.image?.alt}
              width={376}
              height={212}
              className="mx-auto rounded-t-md"
            />

            <p className="mt-6 type-body-sm-medium text-fg-caption">{article.date}</p>
            <h3 className="mt-2 truncate type-title-sm text-fg-heading">{article.title}</h3>
            <p className="mt-2.5 type-body-tight text-fg-body">{article.summary}</p>

            <LandingLink
              href={`/docuhealth-news#${article.slug}`}
              aria-label={`Read more: ${article.title}`}
              className="mt-auto inline-flex items-center gap-2.5 pt-6 type-body-sm-tight-semibold text-primary hover:underline"
            >
              Read More
              <CaretRightIcon className="size-3.5" />
            </LandingLink>
          </RevealItem>
        ))}
      </RevealGroup>
    </LandingContainer>
  );
}
