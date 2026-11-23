import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { visitQuery } from "@/features/clinical/api/queries";
import { visitListSchema } from "@/features/clinical/api/schemas";
import { AdmissionCharts } from "@/features/clinical/components/admission-charts";
import { PatientPage } from "@/features/clinical/components/patient-page";
import { TaskQueue } from "@/features/nurse/components/task-queue";

export const Route = createFileRoute("/hospital/nurse/patients/$visitId")({
  validateSearch: z.object({
    list: visitListSchema.default("inpatient").catch("inpatient"),
  }),
  loaderDeps: ({ search }) => ({ list: search.list }),
  loader: ({ context, deps, params }) =>
    context.queryClient.ensureQueryData(visitQuery(deps.list, params.visitId)),
  component: VisitPage,
});

/** The patient page, with the nurse's tasks and charts on an admission. */
function VisitPage() {
  const { visitId } = Route.useParams();
  const { list } = Route.useSearch();
  return (
    <PatientPage
      list={list}
      visitId={visitId}
      tabs={(visit) =>
        visit.kind === "admission"
          ? [
              {
                value: "tasks",
                label: "Nursing tasks",
                content: <TaskQueue admissionId={visit.id} />,
              },
              {
                value: "charts",
                label: "Charts",
                content: <AdmissionCharts admissionId={visit.id} />,
              },
            ]
          : []
      }
    />
  );
}
