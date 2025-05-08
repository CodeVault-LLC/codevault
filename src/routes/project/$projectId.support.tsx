import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/project/$projectId/support")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/project/$projectId/support"!</div>;
}
