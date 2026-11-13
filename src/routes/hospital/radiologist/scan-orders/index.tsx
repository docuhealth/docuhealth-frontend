import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SCAN_ORDERS_PAGE_SIZES, scanRecordListQuery } from "@/features/radiologist/api/queries";
import { ScanOrders } from "@/features/radiologist/components/scan-orders";
import { periodSchema } from "@/lib/period";

export const Route = createFileRoute("/hospital/radiologist/scan-orders/")({
  validateSearch: z.object({ period: periodSchema.default("week").catch("week") }),
  loaderDeps: ({ search }) => ({ period: search.period }),
  loader: ({ context: { queryClient }, deps }) =>
    // The table starts on this.
    queryClient.ensureQueryData(
      scanRecordListQuery({
        stage: "pending",
        search: "",
        sort: "latest",
        page: 1,
        pageSize: SCAN_ORDERS_PAGE_SIZES.list,
        period: deps.period,
      }),
    ),
  component: ScanOrdersPage,
});

function ScanOrdersPage() {
  const { period } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <title>Scan Orders · DocuHealth</title>
      <ScanOrders
        period={period}
        onPeriodChange={(next) => void navigate({ search: { period: next } })}
      />
    </>
  );
}
