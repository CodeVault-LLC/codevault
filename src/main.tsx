import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import { NotFound } from "./components/NotFound";
import "./index.css";

declare module "@tanstack/react-router" {
  interface _Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,

  context: {
    router: undefined!, // We'll inject this when we render
  },

  defaultNotFoundComponent: () => {
    return <NotFound />;
  },
});
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} context={{ router }} />
  </QueryClientProvider>
);
