import { createFileRoute } from "@tanstack/react-router";
import { prescriptionQuery } from "@/features/pharmacy/api/queries";
import { PrescriptionDetails } from "@/features/pharmacy/components/prescription-details";

export const Route = createFileRoute("/hospital/pharmacy/prescriptions/$prescriptionId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(prescriptionQuery(params.prescriptionId)),
  component: PrescriptionPage,
});

function PrescriptionPage() {
  const { prescriptionId } = Route.useParams();
  return <PrescriptionDetails prescriptionId={prescriptionId} />;
}
