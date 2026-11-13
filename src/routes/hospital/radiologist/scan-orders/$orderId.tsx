import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { scanOrderQuery } from "@/features/radiologist/api/queries";
import { ScanOrderDetails } from "@/features/radiologist/components/scan-order-details";

export const Route = createFileRoute("/hospital/radiologist/scan-orders/$orderId")({
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(scanOrderQuery(params.orderId)),
  component: ScanOrderPage,
  errorComponent: ScanOrderNotFound,
});

function ScanOrderPage() {
  const { orderId } = Route.useParams();
  return <ScanOrderDetails orderId={orderId} />;
}

function ScanOrderNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-16 text-center">
      <title>Scan order not found · DocuHealth</title>
      <h1 className="type-h4">We couldn’t find this scan order</h1>
      <p className="type-body-sm-regular text-fg-caption">The link may be wrong or out of date.</p>
      <Button asChild variant="outline" className="h-11 px-5">
        <Link to="/hospital/radiologist/scan-orders">Back to Scan orders</Link>
      </Button>
    </div>
  );
}
