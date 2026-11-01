import { createRouter } from "@tanstack/react-router";
import { createQueryClient } from "@/lib/query-client";
import { routeTree } from "@/routeTree.gen";

export const queryClient = createQueryClient();

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  // Let TanStack Query own caching; the router just triggers loads.
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
