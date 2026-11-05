import { createFileRoute, Link, Outlet, redirect, useMatch } from "@tanstack/react-router";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/_auth")({
  // Signed-in users have no business on the auth pages.
  beforeLoad: () => {
    if (useAuthStore.getState().session) throw redirect({ to: "/" });
  },
  component: AuthLayoutRoute,
});

function AuthLayoutRoute() {
  const signingUp = useMatch({
    from: "/_auth/register",
    shouldThrow: false,
    select: (match) => match.search.type === "individual",
  });
  const loggingIn = useMatch({ from: "/_auth/login", shouldThrow: false });

  return (
    <AuthLayout
      headerAction={
        (signingUp || loggingIn) && (
          <p className="type-body-sm-tight text-fg-body">
            Are you a HealthCare Provider?{" "}
            <Link
              to={signingUp ? "/hospital/register" : "/hospital/login"}
              className="type-link-sm text-primary underline underline-offset-2"
            >
              Switch
            </Link>
          </p>
        )
      }
    >
      <Outlet />
    </AuthLayout>
  );
}
