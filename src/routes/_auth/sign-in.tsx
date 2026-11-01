import { createFileRoute, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const Route = createFileRoute("/_auth/sign-in")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: SignInPage,
});

function SignInPage() {
  const { redirect } = Route.useSearch();
  const router = useRouter();

  return (
    <Card>
      <title>Sign in</title>
      <CardHeader>
        <CardTitle className="text-h2">Sign in</CardTitle>
        <CardDescription>Welcome back.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm
          onSuccess={() =>
            redirect ? router.history.push(redirect) : void router.navigate({ to: "/dashboard" })
          }
        />
      </CardContent>
    </Card>
  );
}
