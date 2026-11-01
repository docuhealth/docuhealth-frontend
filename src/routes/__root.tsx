import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export type RouterContext = { queryClient: QueryClient };

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster richColors />
      {import.meta.env.DEV && (
        <>
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools buttonPosition="bottom-left" />
        </>
      )}
    </>
  );
}

function NotFound() {
  return (
    <main className="grid min-h-svh place-content-center gap-4 p-6 text-center">
      <title>Page not found</title>
      <h1 className="text-h1">Page not found</h1>
      <p className="text-muted-foreground">The page you’re looking for doesn’t exist.</p>
      <Button asChild>
        <Link to="/">Go home</Link>
      </Button>
    </main>
  );
}
