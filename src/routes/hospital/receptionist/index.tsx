import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  appointmentListQuery,
  receptionOverviewQuery,
  receptionQueueQuery,
} from "@/features/receptionist/api/queries";
import { ReceptionistDashboard } from "@/features/receptionist/components/receptionist-dashboard";
import { periodSchema } from "@/lib/period";

export const Route = createFileRoute("/hospital/receptionist/")({
  validateSearch: z.object({ period: periodSchema.default("week").catch("week") }),
  loaderDeps: ({ search }) => ({ period: search.period }),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(receptionOverviewQuery(deps.period)),
      queryClient.ensureQueryData(appointmentListQuery("today", "")),
      queryClient.ensureQueryData(receptionQueueQuery("")),
    ]),
  component: DashboardPage,
});

function DashboardPage() {
  const { period } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <title>Dashboard · DocuHealth</title>
      <ReceptionistDashboard
        period={period}
        onPeriodChange={(next) => void navigate({ search: { period: next } })}
      />
    </>
  );
}
