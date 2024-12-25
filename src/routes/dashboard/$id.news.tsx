import { createFileRoute } from "@tanstack/react-router";
import { FC } from "react";

const NewsLayout: FC = () => {
  return <div className="mt-4" />;
};

export const Route = createFileRoute("/dashboard/$id/news")({
  component: NewsLayout,
});
