import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  dashboardOverviewQuery,
  patientQueueQuery,
  staffListQuery,
} from "@/features/hospital-admin/api/queries";
import { periodSchema } from "@/lib/period";
import { AdminDashboard } from "@/features/hospital-admin/components/admin-dashboard";

export const Route = createFileRoute("/hospital/admin/")({
  validateSearch: z.object({ period: periodSchema.default("week").catch("week") }),
  loaderDeps: ({ search }) => ({ period: search.period }),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(dashboardOverviewQuery(deps.period)),
      queryClient.ensureQueryData(patientQueueQuery("")),
      queryClient.ensureQueryData(staffListQuery("", 1)),
    ]),
  component: DashboardPage,
});

function DashboardPage() {
  const { period } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <title>Dashboard · DocuHealth</title>
      <AdminDashboard
        period={period}
        onPeriodChange={(next) => void navigate({ search: { period: next } })}
      />
    </>
  );
}
