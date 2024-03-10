import type { MetaFunction } from "@remix-run/node";
import ProductComponent from "~/components/Product";
import Promo from "~/components/Promo";

export const meta: MetaFunction = () => {
  return [
    { title: "CodeVault" },
    { name: "description", content: "CodeVault is a perfect solution when in needs of products!" },
  ];
};

export default function Index() {
  const products: Product[] = [
    {
      name: "Crypto Wallet",
      description: "A digital wallet for cryptocurrency.",
      link: "/crypto-wallet",

      colors: ["197, 93%, 66%", "345, 100%, 92%"],

      updated: "2021-01-01",
    },

    {
      name: "Firebase Auth",
      description: "How to use Firebase for authentication.",
      link: "/firebase-auth",
      colors: ["170, 84%, 73%"],

      updated: "2021-01-02",
    },
  ];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-4">CodeVault</h1>

        <p>
          Welcome to CodeVault, a collection of code snippets and products for
          developers.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">The wall</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product, index: number) => (
            <ProductComponent key={index} product={product} />
          ))}
        </div>

        <div className="mt-8" />
        <Promo sosial="discord" link="https://discord.gg" />
      </div>
    </div>
  );
}
