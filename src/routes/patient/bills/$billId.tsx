import { createFileRoute } from "@tanstack/react-router";
import { BillDetails } from "@/features/patient/components/bill-details";

export const Route = createFileRoute("/patient/bills/$billId")({
  component: Page,
});

function Page() {
  const { billId } = Route.useParams();
  return <BillDetails billId={billId} />;
}
