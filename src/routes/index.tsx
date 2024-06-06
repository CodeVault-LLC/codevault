import ProductComponent from "@/components/ProductComponent";
import Promo from "@/components/Promo";
import { seo } from "@/lib/seo";
import { products } from "@/products";
import { createFileRoute } from "@tanstack/react-router";

const Home: React.FC = () => {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div className="flex justify-center items-center flex-col">
        <div className="flex flex-row items-center justify-between gap-4 mb-4">
          <img
            src="https://avatars.githubusercontent.com/u/160372018?s=48&v=4"
            alt="CodeVault"
            className="w-16 h-16 rounded-full"
          />

          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text uppercase">
            CodeVault
          </h1>
        </div>
        <span className="text-3xl line-clamp-2 font-bold max-w-lg text-center">
          High-quality tools made for developers,{" "}
          <span className="uppercase bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">
            by developers
          </span>
        </span>

        <span className="text-lg mt-1 dark:text-gray-400 max-w-xl">
          CodeVault is a perfect solution when in needs of products! It offers a
          wide range of products that are made by developers for developers.
        </span>
      </div>

      <section className="mt-8">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Powerful products for every team
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-28">
          {products.map((product, index: number) => (
            <ProductComponent key={index} product={product} />
          ))}
        </div>
      </section>

      <div className="mt-8" />
      <Promo sosial="discord" link="https://discord.gg" />
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
