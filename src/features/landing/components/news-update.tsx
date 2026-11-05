import { CaretRightIcon } from "@phosphor-icons/react";
import acpnImage from "@/assets/images/acpn.png";
import cacImage from "@/assets/images/cac.png";
import hospPharmImage from "@/assets/images/hosp-pharm.png";

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
    title: "Corporate Affairs Commission (CAC) certifi...",
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
    <section id="news" className="mx-auto w-full max-w-11/12 px-4 py-16 sm:py-20 lg:py-28 xl:px-6">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <h2 className="type-accent-h1 md:type-h2">
          <span className="font-normal">Latest DocuHealth</span> <br />
          <span className="font-bold">News & Updates</span>
        </h2>
        <p className="mt-3 max-w-md type-body-sm-regular text-fg-body sm:type-body">
          Stay informed about DocuHealth platform updates and health information.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
        {articles.map((article) => (
          <article
            key={article.title}
            className="flex flex-col justify-between rounded-2xl border border-line bg-card p-4 shadow-xs transition-shadow hover:shadow-md sm:p-5"
          >
            <div>
              <div className="overflow-hidden rounded-xl border border-line/60">
                <img
                  src={article.image}
                  alt={article.alt}
                  className="aspect-16/10 w-full object-cover"
                />
              </div>

              <div className="mt-4">
                <p className="type-caption text-fg-caption">{article.date}</p>
                <h3 className="mt-2 type-body font-bold text-fg-heading">{article.title}</h3>
                <p className="mt-2 type-body-sm-regular text-fg-body">{article.description}</p>
              </div>
            </div>

            <a
              href={article.href}
              className="mt-6 inline-flex items-center gap-1 type-link-sm text-primary hover:underline"
            >
              <span>Read More</span>
              <CaretRightIcon className="size-3.5" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
