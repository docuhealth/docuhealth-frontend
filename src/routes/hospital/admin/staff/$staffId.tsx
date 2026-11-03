import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { staffDetailQuery } from "@/features/hospital-admin/api/queries";
import { periodSchema } from "@/lib/period";
import { StaffProfile } from "@/features/hospital-admin/components/staff-profile";

export const Route = createFileRoute("/hospital/admin/staff/$staffId")({
  validateSearch: z.object({ period: periodSchema.default("month").catch("month") }),
  loaderDeps: ({ search }) => ({ period: search.period }),
  loader: ({ context: { queryClient }, params, deps }) =>
    queryClient.ensureQueryData(staffDetailQuery(params.staffId, deps.period)),
  component: StaffProfilePage,
  errorComponent: StaffNotFound,
});

function StaffProfilePage() {
  const { staffId } = Route.useParams();
  const { period } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <StaffProfile
      staffId={staffId}
      period={period}
      onPeriodChange={(next) => void navigate({ search: { period: next } })}
    />
  );
}

function StaffNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-16 text-center">
      <title>Staff member not found · DocuHealth</title>
      <h1 className="type-h4">We couldn’t find this staff member</h1>
      <p className="type-body-sm-regular text-fg-caption">
        They may have been removed, or the link is wrong.
      </p>
      <Button asChild variant="outline" className="h-11 px-5">
        <Link to="/hospital/admin/staff">Back to Staff Mgt.</Link>
      </Button>
    </div>
  );
}
