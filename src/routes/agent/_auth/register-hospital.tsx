import { createFileRoute } from "@tanstack/react-router";
import { AgentHospitalRegistration } from "@/features/auth/components/agent-hospital-registration";

export const Route = createFileRoute("/agent/_auth/register-hospital")({
  component: RegisterHospitalPage,
});

function RegisterHospitalPage() {
  return (
    <>
      <title>Register a hospital · DocuHealth</title>
      <AgentHospitalRegistration />
    </>
  );
}
