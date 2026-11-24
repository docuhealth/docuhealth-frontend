import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AgentHospitalRegistration } from "@/features/auth/components/agent-hospital-registration";

/**
 * Registering a facility in person (a field agent's job). The API only lets DocuHealth's admins
 * do it for now, so it's here, behind their login.
 */
export const Route = createFileRoute("/admin/_dashboard/register-facility")({
  component: RegisterFacilityPage,
});

function RegisterFacilityPage() {
  const navigate = useNavigate();
  return (
    <>
      <title>Register a facility · DocuHealth admin</title>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-0.5">
          <h1 className="type-h4">Register a facility</h1>
          <p className="type-body-sm-regular text-fg-caption">
            Add a facility you’ve visited in person. It’s active straight away, and its admin is
            emailed a temporary password.
          </p>
        </div>
        <section
          aria-label="Facility details"
          className="w-full max-w-xl rounded-xl border bg-card p-4 sm:p-8"
        >
          <AgentHospitalRegistration onDone={() => void navigate({ to: "/admin" })} />
        </section>
      </div>
    </>
  );
}
