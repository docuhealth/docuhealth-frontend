import { createFileRoute } from "@tanstack/react-router";
import { ProviderInfoForm } from "@/features/auth/components/provider-info-form";

export const Route = createFileRoute("/hospital/_auth/register")({
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
