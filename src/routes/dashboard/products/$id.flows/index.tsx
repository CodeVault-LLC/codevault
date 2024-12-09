import { createFileRoute } from "@tanstack/react-router";
import { FC } from "react";

const FlowsOverview: FC = () => {
  return <div>Hello /dashboard/products/$id/flows!</div>;
};

export const Route = createFileRoute("/dashboard/products/$id/flows/")({
  component: FlowsOverview,
});
