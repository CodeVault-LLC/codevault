import { createRouter as TanstackCreateRouter } from "@tanstack/react-router";
import { NotFound } from "./components/not-found";
import { routeTree } from "./routeTree.gen";
import { queryClient } from "./client/query";

export const createRouter = () => {
  const router = TanstackCreateRouter({
    routeTree,
    defaultPreloadDelay: 0,
    defaultPendingMinMs: 0,
    defaultPendingMs: 0,
    defaultPreload: "intent",
    defaultStaleTime: 1,
    defaultNotFoundComponent: () => {
      return <NotFound />;
    },
    context: {
      queryClient,
    },
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
