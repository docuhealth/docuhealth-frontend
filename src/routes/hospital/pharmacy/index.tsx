import { createFileRoute } from "@tanstack/react-router";
import { pharmacyOverviewQuery } from "@/features/pharmacy/api/queries";
import { PharmacyDashboard } from "@/features/pharmacy/components/pharmacy-dashboard";

export const Route = createFileRoute("/hospital/pharmacy/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pharmacyOverviewQuery()),
  component: OverviewPage,
});

function OverviewPage() {
  return (
    <>
      <title>Overview · DocuHealth</title>
      <PharmacyDashboard />
    </>
  );
}
