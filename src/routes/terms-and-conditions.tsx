import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { TermsPage } from "@/features/landing/components/terms-page";

export const Route = createFileRoute("/terms-and-conditions")({
  validateSearch: z.object({
    for: z.enum(["patient", "hospital"]).default("patient").catch("patient"),
  }),
  component: TermsAndConditionsPage,
});

function TermsAndConditionsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <TermsPage
      audience={search.for}
      onAudienceChange={(next) => void navigate({ search: { for: next }, replace: true })}
    />
  );
}
