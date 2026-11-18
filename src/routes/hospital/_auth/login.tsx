import { createFileRoute } from "@tanstack/react-router";
import { redirectIfSignedIn } from "@/lib/auth-guards";
import { LoginForm } from "@/features/auth/components/login-form";

export const Route = createFileRoute("/hospital/_auth/login")({
  beforeLoad: redirectIfSignedIn,
  component: HospitalLoginPage,
});

function HospitalLoginPage() {
  return (
    <>
      <title>Hospital log in · DocuHealth</title>
      <LoginForm audience="hospital" />
    </>
  );
}
