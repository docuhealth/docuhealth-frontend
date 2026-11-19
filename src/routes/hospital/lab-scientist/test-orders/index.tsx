import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { TEST_RECORDS_PAGE_SIZES, testRecordListQuery } from "@/features/lab-scientist/api/queries";
import { TestOrders } from "@/features/lab-scientist/components/test-orders";
import { periodSchema } from "@/lib/period";

export const Route = createFileRoute("/hospital/lab-scientist/test-orders/")({
  validateSearch: z.object({ period: periodSchema.default("week").catch("week") }),
  loaderDeps: ({ search }) => ({ period: search.period }),
  loader: ({ context: { queryClient }, deps }) =>
    // The table starts on this.
    queryClient.ensureQueryData(
      testRecordListQuery({
        stage: "pending",
        search: "",
        sort: "latest",
        page: 1,
        pageSize: TEST_RECORDS_PAGE_SIZES.list,
        period: deps.period,
      }),
    ),
  component: TestOrdersPage,
});

function TestOrdersPage() {
  const { period } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <title>Test Orders · DocuHealth</title>
      <TestOrders
        period={period}
        onPeriodChange={(next) => void navigate({ search: { period: next } })}
      />
    </>
  );
}
