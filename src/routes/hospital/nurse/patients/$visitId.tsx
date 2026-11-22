import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { visitQuery } from "@/features/clinical/api/queries";
import { visitListSchema } from "@/features/clinical/api/schemas";
import { PatientPage } from "@/features/clinical/components/patient-page";

export const Route = createFileRoute("/hospital/nurse/patients/$visitId")({
  validateSearch: z.object({
    list: visitListSchema.default("inpatient").catch("inpatient"),
  }),
  loaderDeps: ({ search }) => ({ list: search.list }),
  loader: ({ context, deps, params }) =>
    context.queryClient.ensureQueryData(visitQuery(deps.list, params.visitId)),
  component: VisitPage,
});

function VisitPage() {
  const { visitId } = Route.useParams();
  const { list } = Route.useSearch();
  return <PatientPage list={list} visitId={visitId} />;
}
