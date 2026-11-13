import { createFileRoute } from "@tanstack/react-router";
import { VerifyNinForm } from "@/features/auth/components/verify-nin-form";

export const Route = createFileRoute("/_auth/verify-nin")({
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
