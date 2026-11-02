import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { AuthLayout } from "@/features/auth/components/auth-layout";

/** Auth pages of the hospital site (hospital.<domain>). */
export const Route = createFileRoute("/hospital/_auth")({
  component: HospitalAuthLayout,
});

function HospitalAuthLayout() {
  const registering = useMatch({ from: "/hospital/_auth/register", shouldThrow: false });

  return (
    <AuthLayout
      headerAction={
        registering && (
          <p className="type-body-sm-tight text-fg-body">
            Are you an Individual?{" "}
            <Link
              to="/register"
              search={{ type: "individual" }}
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
