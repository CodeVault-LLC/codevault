import ReactDOM from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { NotFound } from "./components/NotFound";
import { queryClient } from "./client/query";

declare module "@tanstack/react-router" {
  interface _Register {
    router: typeof router;
  }
}

const router = createRouter({
  routeTree,
  // load the page instantly
  defaultPreloadDelay: 0,
  defaultPendingMinMs: 0,
  defaultPendingMs: 0,

  context: {
    router: undefined!, // We'll inject this when we render
  },
  defaultNotFoundComponent: () => {
    return <NotFound />;
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} context={{ router }} />
  </QueryClientProvider>
);
