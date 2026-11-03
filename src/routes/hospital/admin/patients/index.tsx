import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  patientFilterOptionsQuery,
  patientListQuery,
  patientStatsQuery,
} from "@/features/hospital-admin/api/queries";
import { patientTabSchema } from "@/features/hospital-admin/api/schemas";
import { periodSchema } from "@/lib/period";
import { PatientManagement } from "@/features/hospital-admin/components/patient-management";
import { patientListParams } from "@/features/hospital-admin/lib/patient-filters";

export const Route = createFileRoute("/hospital/admin/patients/")({
  validateSearch: z.object({
    period: periodSchema.default("month").catch("month"),
    tab: patientTabSchema.default("admitted").catch("admitted"),
  }),
  loaderDeps: ({ search }) => ({ period: search.period, tab: search.tab }),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(patientStatsQuery(deps.period)),
      queryClient.ensureQueryData(patientListQuery(patientListParams(deps.tab))),
      queryClient.ensureQueryData(patientFilterOptionsQuery()),
    ]),
  component: PatientsPage,
});

function PatientsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <title>Patient Management · DocuHealth</title>
      <PatientManagement
        period={search.period}
        onPeriodChange={(period) => void navigate({ search: { ...search, period } })}
        tab={search.tab}
        onTabChange={(tab) => void navigate({ search: { ...search, tab } })}
      />
    </>
  );
}
