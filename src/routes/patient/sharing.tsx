import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SharingPage } from "@/features/patient/components/sharing-page";
import { sharingTabs } from "@/features/patient/lib/sharing";

export const Route = createFileRoute("/patient/sharing")({
  // The open tab; "Share my record" when absent.
  validateSearch: z.object({ tab: z.enum(sharingTabs).optional().catch(undefined) }),
  component: Page,
});

function Page() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <SharingPage
      tab={tab ?? "share"}
      onTab={(next) => void navigate({ search: next === "share" ? {} : { tab: next } })}
    />
  );
}
