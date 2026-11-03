import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { patientDetailQuery } from "@/features/hospital-admin/api/queries";
import { PatientProfile } from "@/features/hospital-admin/components/patient-profile";

export const Route = createFileRoute("/hospital/admin/patients/$patientId")({
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(patientDetailQuery(params.patientId)),
  component: PatientProfilePage,
  errorComponent: PatientNotFound,
});

function PatientProfilePage() {
  const { patientId } = Route.useParams();
  return <PatientProfile patientId={patientId} />;
}

function PatientNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-16 text-center">
      <title>Patient not found · DocuHealth</title>
      <h1 className="type-h4">We couldn’t find this patient</h1>
      <p className="type-body-sm-regular text-fg-caption">The link may be wrong or out of date.</p>
      <Button asChild variant="outline" className="h-11 px-5">
        <Link to="/hospital/admin/patients">Back to Patient Mgt.</Link>
      </Button>
    </div>
  );
}
