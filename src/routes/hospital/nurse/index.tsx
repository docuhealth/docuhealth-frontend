import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { clinicalProfileQuery } from "@/features/clinical/api/queries";
import { NurseOverview } from "@/features/nurse/components/nurse-overview";

export const Route = createFileRoute("/hospital/nurse/")({
  component: OverviewPage,
});

function OverviewPage() {
  const { data: profile } = useSuspenseQuery(clinicalProfileQuery());
  return (
    <>
      <title>Overview · DocuHealth</title>
      <NurseOverview firstName={profile.user.firstName} />
    </>
  );
}
