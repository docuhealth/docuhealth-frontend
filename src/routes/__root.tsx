import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  type ErrorComponentProps,
  Link,
  Outlet,
  useRouter,
} from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export type RouterContext = { queryClient: QueryClient };

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: PageError,
});

function RootLayout() {
  return (
    <>
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
      <Toaster richColors />
    </>
  );
}

function NotFound() {
  return (
    <main className="grid min-h-svh place-content-center gap-4 p-6 text-center">
      <title>Page not found</title>
      <h1 className="type-accent-h1">Page not found</h1>
      <p className="text-muted-foreground">The page you’re looking for doesn’t exist.</p>
      <Button asChild>
        <Link to="/">Go home</Link>
      </Button>
    </main>
  );
}

/**
 * When a page can't load. A 401 that survived the token refresh means the sign-in has ended
 * (the session is already cleared), so the way on is to log in again.
 */
function PageError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const signedOut = isAxiosError(error) && error.response?.status === 401;
  return (
    <main className="grid min-h-svh place-content-center gap-4 p-6 text-center">
      <title>{signedOut ? "Signed out" : "Something went wrong"}</title>
      <h1 className="type-accent-h1">{signedOut ? "You’re signed out" : "Something went wrong"}</h1>
      <p className="text-muted-foreground">
        {signedOut
          ? "Your sign-in has ended. Log in again to carry on."
          : "This page couldn’t load. Try again in a moment."}
      </p>
      <div className="flex justify-center gap-3">
        {signedOut ? (
          <Button asChild>
            <Link to="/login">Log in again</Link>
          </Button>
        ) : (
          <>
            <Button variant="outline" asChild>
              <Link to="/">Go home</Link>
            </Button>
            <Button
              onClick={() => {
                reset();
                void router.invalidate();
              }}
            >
              Try again
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
