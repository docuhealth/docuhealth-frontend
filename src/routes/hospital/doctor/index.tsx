import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { clinicalProfileQuery } from "@/features/clinical/api/queries";
import { DoctorOverview } from "@/features/doctor/components/doctor-overview";

export const Route = createFileRoute("/hospital/doctor/")({
  component: OverviewPage,
});

function OverviewPage() {
  const { data: profile } = useSuspenseQuery(clinicalProfileQuery());
  return (
    <>
      <title>Overview · DocuHealth</title>
      <DoctorOverview firstName={profile.user.firstName} bannerUrl={profile.hospital.bannerUrl} />
    </>
  );
}
