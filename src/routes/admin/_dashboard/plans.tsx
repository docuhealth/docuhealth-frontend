import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionPlans } from "@/features/dh-admin/components/subscription-plans";

export const Route = createFileRoute("/admin/_dashboard/plans")({
  component: PlansPage,
});

function PlansPage() {
  return (
    <>
      <title>Subscription plans · DocuHealth admin</title>
      <SubscriptionPlans />
    </>
  );
}
