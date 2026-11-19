import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  labOverviewQuery,
  pendingApprovalsQuery,
  testAppointmentsQuery,
} from "@/features/lab-scientist/api/queries";
import { LabDashboard } from "@/features/lab-scientist/components/lab-dashboard";
import { periodSchema } from "@/lib/period";

export const Route = createFileRoute("/hospital/lab-scientist/")({
  validateSearch: z.object({ period: periodSchema.default("week").catch("week") }),
  loaderDeps: ({ search }) => ({ period: search.period }),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(labOverviewQuery(deps.period)),
      // The cards start on these.
      queryClient.ensureQueryData(testAppointmentsQuery("week")),
      queryClient.ensureQueryData(pendingApprovalsQuery()),
    ]),
  component: DashboardPage,
});

function DashboardPage() {
  const { period } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <title>Overview · DocuHealth</title>
      <LabDashboard
        period={period}
        onPeriodChange={(next) => void navigate({ search: { period: next } })}
      />
    </>
  );
}
