import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AccountTypeForm } from "@/features/auth/components/account-type-form";
import { IndividualSignUp } from "@/features/auth/components/individual-sign-up";

export const Route = createFileRoute("/_auth/register")({
  // No `type` yet means the user still has to choose an account type. Providers register on the
  // hospital site, so only "individual" is valid here.
  validateSearch: z.object({ type: z.literal("individual").optional().catch(undefined) }),
  component: RegisterPage,
});

function RegisterPage() {
  const { type } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <title>Create account · DocuHealth</title>
      {type === "individual" ? (
        <IndividualSignUp />
      ) : (
        <AccountTypeForm
          onContinue={(accountType) =>
            void (accountType === "individual"
              ? navigate({ search: { type: "individual" } })
              : navigate({ to: "/hospital/register" }))
          }
        />
      )}
    </>
  );
}
