import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { fireEvent, render, type RenderOptions, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactElement, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";

function testQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

/** Render with the app's providers and a fresh, retry-free query client. */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const queryClient = testQueryClient();

  return {
    user: userEvent.setup(),
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        {ui}
        <Toaster />
      </QueryClientProvider>,
      options,
    ),
  };
}

/**
 * `renderWithProviders` inside a router, for components with `<Link>`s, and a Suspense boundary
 * for ones that suspend on their query. It renders asynchronously, so find things with `find*`.
 */
export function renderWithRouter(ui: ReactElement) {
  const queryClient = testQueryClient();
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => <Suspense fallback={<p>Loading…</p>}>{ui}</Suspense>,
    }),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  return {
    user: userEvent.setup(),
    queryClient,
    router,
    ...render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>,
    ),
  };
}

/**
 * Picks `name` from an open Base UI select list. The list ignores real pointer clicks while it
 * animates open, and a plain synthetic click only counts on the highlighted item, so send the
 * click assistive technology would (`pointerType: ""`), which selects any item.
 */
export async function pickOption(name: string) {
  const option = await screen.findByRole("option", { name });
  fireEvent(
    option,
    new PointerEvent("click", { bubbles: true, cancelable: true, pointerType: "" }),
  );
}
