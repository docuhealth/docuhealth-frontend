import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { FinishOldSignup } from "@/features/auth/components/finish-old-signup";

export const Route = createFileRoute("/_auth/verify-account")({
  // Sign-up sends the email along when it finds an unfinished old account for it.
  validateSearch: z.object({ email: z.string().optional().catch(undefined) }),
  component: VerifyAccountPage,
});

function VerifyAccountPage() {
  const { email } = Route.useSearch();

  return (
    <>
      <title>Finish your sign-up · DocuHealth</title>
      <FinishOldSignup defaultEmail={email} />
    </>
  );
}
