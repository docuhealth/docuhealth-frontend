import { createFileRoute } from "@tanstack/react-router";
import { BillsPage } from "@/features/patient/components/bills-page";

export const Route = createFileRoute("/patient/bills/")({
  component: Page,
});

function Page() {
  return <BillsPage />;
}
