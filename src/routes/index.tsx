import { seo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

const Home: React.FC = () => {
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
};

export const Route = createFileRoute("/")({
  component: Home,
  meta: () => {
    return seo({
      title: "Home | Codevault",
      description:
        "The marketing and documentation site for CodeVault Products.",
      keywords: "codevault, products, documentation, marketing",
    });
  },
});
