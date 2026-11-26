import "@/index.css";
import * as Sentry from "@sentry/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { env } from "@/env";
import { restoreSession } from "@/features/auth/api/session";
import { queryClient, router } from "@/router";

if (env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
    tracesSampleRate: 0.1,
  });
}

/**
 * The fake API, on the dev server only: a production build never starts it (and leaves the mocks
 * out of the bundle), whatever VITE_ENABLE_MOCKS says.
 */
async function enableMocks() {
  if (!import.meta.env.DEV || !env.VITE_ENABLE_MOCKS) return;
  const { worker } = await import("@/mocks/browser");
  await worker.start({ onUnhandledFrame: "bypass" });
}

await enableMocks();
// Who is signed in (GET /api/auth/me), before any route guard runs.
await restoreSession();

createRoot(document.getElementById("root")!, {
  onUncaughtError: Sentry.reactErrorHandler(),
  onCaughtError: Sentry.reactErrorHandler(),
}).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
);
