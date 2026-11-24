import { createRouter } from "@tanstack/react-router";
import { RoutePending } from "@/components/dashboard/skeletons";
import { createQueryClient } from "@/lib/query-client";
import { sectionRewrite } from "@/lib/sections";
import { routeTree } from "@/routeTree.gen";

export const queryClient = createQueryClient();

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  // Let TanStack Query own caching; the router just triggers loads.
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  // A page that takes more than a moment shows its shape while it loads.
  defaultPendingComponent: RoutePending,
  rewrite: sectionRewrite,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
