import { createFileRoute } from "@tanstack/react-router";
import { redirectIfSignedIn } from "@/lib/auth-guards";
import { ProviderInfoForm } from "@/features/auth/components/provider-info-form";

export const Route = createFileRoute("/hospital/_auth/register")({
  beforeLoad: redirectIfSignedIn,
  component: RegisterFacilityPage,
});

function RegisterFacilityPage() {
  return (
    <>
      <title>Register your facility · DocuHealth</title>
      <ProviderInfoForm />
    </>
  );
}
