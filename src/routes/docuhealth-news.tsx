import { createFileRoute } from "@tanstack/react-router";
import { NewsList } from "@/features/landing/components/news-list";
import { InfoPage } from "@/features/landing/components/info-page";

export const Route = createFileRoute("/docuhealth-news")({
  component: NewsPage,
});

function NewsPage() {
  return (
    <InfoPage
      eyebrow="DocuHealth News"
      title="News & Updates"
      lead="DocuHealth platform updates and health information."
    >
      <NewsList />
    </InfoPage>
  );
}
