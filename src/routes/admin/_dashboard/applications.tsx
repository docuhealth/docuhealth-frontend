import { createFileRoute } from "@tanstack/react-router";
import { FacilityApplications } from "@/features/dh-admin/components/facility-applications";

export const Route = createFileRoute("/admin/_dashboard/applications")({
  component: ApplicationsPage,
});

function ApplicationsPage() {
  return (
    <>
      <title>Facility applications · DocuHealth admin</title>
      <FacilityApplications />
    </>
  );
}
