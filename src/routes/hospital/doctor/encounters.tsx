import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { clinicalProfileQuery } from "@/features/clinical/api/queries";
import { DoctorQueue } from "@/features/doctor/components/doctor-queue";

export const Route = createFileRoute("/hospital/doctor/encounters")({
  component: EncountersPage,
});

function EncountersPage() {
  const { data: profile } = useSuspenseQuery(clinicalProfileQuery());
  return (
    <>
      <title>Doctor Encounter · DocuHealth</title>
      <DoctorQueue myId={profile.user.id} />
    </>
  );
}
