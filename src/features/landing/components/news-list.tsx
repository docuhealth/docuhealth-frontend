import { news } from "@/features/landing/content/pages";

/** Every news item, newest first, each with its anchor so the home page can link to it. */
export function NewsList() {
  return (
    <div className="flex flex-col gap-12">
      {news.map((article) => (
        <article
          key={article.slug}
          id={article.slug}
          aria-labelledby={`${article.slug}-title`}
          className="flex scroll-mt-28 flex-col gap-4 border-b border-line pb-12 last:border-b-0 last:pb-0"
        >
          <p className="type-body-sm-medium text-fg-caption">Posted {article.date}</p>
          <h2 id={`${article.slug}-title`} className="type-title-xl text-fg-heading">
            {article.title}
          </h2>
          {article.image && (
            <img
              src={article.image.src}
              alt={article.image.alt}
              width={376}
              height={212}
              className="w-full max-w-120 rounded-lg"
            />
          )}
          <div className="flex flex-col gap-4 type-body text-fg-body">
            {article.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
