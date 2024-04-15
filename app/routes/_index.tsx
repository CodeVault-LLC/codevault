import type { MetaFunction } from "@remix-run/node";
import ProductComponent from "~/components/Product";
import Promo from "~/components/Promo";

export const meta: MetaFunction = () => {
  return [
    { title: "CodeVault" },
    {
      name: "description",
      content: "CodeVault is a perfect solution when in needs of products!",
    },
  ];
};

export default function Index() {
  const products: Product[] = [
    {
      name: "VaultSQL Navigator",
      description:
        "A powerful SQL Studio making it easier for developers to work with databases.",
      link: "/vaultsql_navigator", // This is a placeholder link

      updated: "2021-01-01",
    },

    {
      name: "Cryptoguard",
      description:
        "Encrypt and decrypt your data with ease with security in mind.",
      link: "/cryptoguard",

      updated: "2021-01-02",
    },
  ];

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
}
