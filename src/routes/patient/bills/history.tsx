import { createFileRoute } from "@tanstack/react-router";
import { PaymentHistoryPage } from "@/features/patient/components/payment-history-page";

export const Route = createFileRoute("/patient/bills/history")({
  component: Page,
});

function Page() {
  return <PaymentHistoryPage />;
}
