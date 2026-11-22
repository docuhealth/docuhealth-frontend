import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { clinicalProfileQuery } from "@/features/clinical/api/queries";
import { NursingEncounters } from "@/features/nurse/components/nursing-encounters";

export const Route = createFileRoute("/hospital/nurse/encounters")({
  component: EncountersPage,
});

function EncountersPage() {
  const { data: profile } = useSuspenseQuery(clinicalProfileQuery());
  const { user } = profile;
  return (
    <>
      <title>Nursing Encounter · DocuHealth</title>
      <NursingEncounters me={{ id: user.id, name: `${user.firstName} ${user.lastName}` }} />
    </>
  );
}
