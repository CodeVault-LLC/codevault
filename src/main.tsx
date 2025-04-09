import { createRoot } from "react-dom/client";
import "./index.css";
import "./client/eljs-setup";
import "highlight.js/styles/github-dark.min.css";
import { createRouter } from "./router";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const router = createRouter();
const client = new QueryClient();

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <QueryClientProvider client={client}>
    <RouterProvider router={router} />
  </QueryClientProvider>
);
