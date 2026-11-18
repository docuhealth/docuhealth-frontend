import { createFileRoute } from "@tanstack/react-router";
import { requireGate } from "@/lib/auth-guards";
import { VerifyNinForm } from "@/features/auth/components/verify-nin-form";

export const Route = createFileRoute("/_auth/verify-nin")({
  beforeLoad: () => requireGate("nin_not_verified"),
  component: VerifyNinPage,
});

function VerifyNinPage() {
  return (
    <>
      <title>Verify NIN · DocuHealth</title>
      <VerifyNinForm />
    </>
  );
}
