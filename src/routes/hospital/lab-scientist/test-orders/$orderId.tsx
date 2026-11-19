import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { testOrderQuery } from "@/features/lab-scientist/api/queries";
import { TestOrderDetails } from "@/features/lab-scientist/components/test-order-details";

export const Route = createFileRoute("/hospital/lab-scientist/test-orders/$orderId")({
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(testOrderQuery(params.orderId)),
  component: TestOrderPage,
  errorComponent: TestOrderNotFound,
});

function TestOrderPage() {
  const { orderId } = Route.useParams();
  return <TestOrderDetails orderId={orderId} />;
}

function TestOrderNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-16 text-center">
      <title>Test order not found · DocuHealth</title>
      <h1 className="type-h4">We couldn’t find this test order</h1>
      <p className="type-body-sm-regular text-fg-caption">The link may be wrong or out of date.</p>
      <Button asChild variant="outline" className="h-11 px-5">
        <Link to="/hospital/lab-scientist/test-orders">Back to Test orders</Link>
      </Button>
    </div>
  );
}
