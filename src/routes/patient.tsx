import { SignOutIcon, UserCircleIcon } from "@phosphor-icons/react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import logoUrl from "@/assets/logos/logo.svg";
import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { useLogOut } from "@/hooks/use-log-out";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/patient")({
  beforeLoad: () => {
    const { session } = useAuthStore.getState();
    if (session?.nextStep === "nin_not_verified") {
      throw redirect({ to: "/verify-nin" });
    }
    if (!session && !env.VITE_ENABLE_MOCKS) {
      throw redirect({ to: "/login" });
    }
  },
  component: PatientDashboardPage,
});

function PatientDashboardPage() {
  const session = useAuthStore((state) => state.session);
  const logOut = useLogOut();

  return (
    <div className="min-h-svh bg-background">
      <title>Patient portal · DocuHealth</title>
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoUrl} alt="" width={32} height={30} />
            <span className="type-accent-h2 text-primary">DocuHealth</span>
          </Link>
          <Button variant="outline" size="sm" onClick={() => void logOut()}>
            <SignOutIcon data-icon="inline-start" />
            Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-8">
        <div className="flex items-start gap-4 rounded-xl border bg-card p-6">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserCircleIcon className="size-7" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="type-h3 text-fg-heading">
              Welcome{session?.user.name ? `, ${session.user.name}` : ""}
            </h1>
            <p className="type-body-sm-regular text-muted-foreground">
              Your DocuHealth patient account is active and verified.
            </p>
            {session?.user.hin && (
              <p className="mt-2 type-body-sm text-fg-heading">
                HIN: <span className="font-mono text-primary">{session.user.hin}</span>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
