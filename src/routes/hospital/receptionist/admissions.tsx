import { createFileRoute } from "@tanstack/react-router";
import { AdmissionRequests } from "@/features/admissions/components/admission-requests";

export const Route = createFileRoute("/hospital/receptionist/admissions")({
  component: AdmissionsPage,
});

function AdmissionsPage() {
  return (
    <>
      <title>Admission Requests · DocuHealth</title>
      <AdmissionRequests />
    </>
  );
}
