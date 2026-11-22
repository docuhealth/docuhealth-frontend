import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { visitListQuery } from "@/features/clinical/api/queries";
import { visitListSchema } from "@/features/clinical/api/schemas";
import { ClinicalPatients } from "@/features/clinical/components/clinical-patients";

export const Route = createFileRoute("/hospital/nurse/patients/")({
  validateSearch: z.object({
    list: visitListSchema.default("inpatient").catch("inpatient"),
  }),
  loaderDeps: ({ search }) => ({ list: search.list }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(visitListQuery(deps.list, "", 1)),
  component: PatientsPage,
});

function PatientsPage() {
  const { list } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <>
      <title>Patient Management · DocuHealth</title>
      <ClinicalPatients
        dashboard="nurse"
        list={list}
        onListChange={(next) => void navigate({ search: { list: next } })}
      />
    </>
  );
}
