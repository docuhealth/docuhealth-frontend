import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { AuthLayout } from "@/features/auth/components/auth-layout";

/** Auth pages of the hospital site (hospital.<domain>). */
export const Route = createFileRoute("/hospital/_auth")({
  component: HospitalAuthLayout,
});

function HospitalAuthLayout() {
  const registering = useMatch({ from: "/hospital/_auth/register", shouldThrow: false });
  const loggingIn = useMatch({ from: "/hospital/_auth/login", shouldThrow: false });

  return (
    <AuthLayout
      headerAction={
        (registering || loggingIn) && (
          <p className="type-body-sm-tight text-fg-body">
            Are you an Individual?{" "}
            {registering ? (
              <Link
                to="/register"
                search={{ type: "individual" }}
                className="type-link-sm text-primary underline underline-offset-2"
              >
                Switch
              </Link>
            ) : (
              <Link to="/login" className="type-link-sm text-primary underline underline-offset-2">
                Switch
              </Link>
            )}
          </p>
        )
      }
    >
      <Outlet />
    </AuthLayout>
  );
}
