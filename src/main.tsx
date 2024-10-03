import ReactDOM from "react-dom/client";
import { createRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { StartClient } from "@tanstack/start";
import { routeTree } from "./routeTree.gen";
import { NotFound } from "./components/NotFound";
import "./index.css";
import { queryClient } from "./client/query";

declare global {
  namespace React.JSX {
    // eslint-disable-next-line no-unused-vars -- This is a custom element
    interface IntrinsicElements {
      // eslint-disable-next-line no-undef -- This is a custom element
      "stripe-pricing-table": React.DetailedHTMLProps<
        // eslint-disable-next-line no-undef -- This is a custom element
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

declare module "@tanstack/react-router" {
  interface _Register {
    router: typeof router;
  }
}

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
    <StartClient router={router} />
  </QueryClientProvider>
);
