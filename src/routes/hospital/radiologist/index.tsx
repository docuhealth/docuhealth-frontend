import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  radiologyOverviewQuery,
  SCAN_RECORDS_PAGE_SIZES,
  recentUploadsQuery,
  scanRecordListQuery,
  scanScheduleQuery,
} from "@/features/radiologist/api/queries";
import { RadiologistDashboard } from "@/features/radiologist/components/radiologist-dashboard";
import { periodSchema } from "@/lib/period";

export const Route = createFileRoute("/hospital/radiologist/")({
  validateSearch: z.object({ period: periodSchema.default("week").catch("week") }),
  loaderDeps: ({ search }) => ({ period: search.period }),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(radiologyOverviewQuery(deps.period)),
      // The cards and the records start on these.
      queryClient.ensureQueryData(scanScheduleQuery("week")),
      queryClient.ensureQueryData(recentUploadsQuery("week")),
      queryClient.ensureQueryData(
        scanRecordListQuery({
          stage: "pending",
          search: "",
          sort: "latest",
          page: 1,
          pageSize: SCAN_RECORDS_PAGE_SIZES.list,
        }),
      ),
    ]),
  component: DashboardPage,
});

function DashboardPage() {
  const { period } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <title>Overview · DocuHealth</title>
      <RadiologistDashboard
        period={period}
        onPeriodChange={(next) => void navigate({ search: { period: next } })}
      />
    </>
  );
}
