import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import { useMemo, useState } from "react";
import { RenderMarkdown } from "~/components/RenderMarkdown";
import { loadProject } from "~/utils/document";

export const loader = async (context: LoaderFunctionArgs) => {
  const { "*": docsPath } = context.params;
  const project = "cryptoguard";
  const file = `${docsPath}.md`;

  return loadProject(project, file);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: "CryptoGuard | CodeVault" },
    { name: "description", content: data?.excerpt || "" },
  ];
};

type NavData = {
  label: string;
  children: {
    label: string;
    to: string;
  }[];
};

export default function Docs() {
  const data: {
    content: string;
  } = useLoaderData();
  const location = useLocation();
  const [search, setSearch] = useState<string>("");
  const [filteredData, setFilteredData] = useState<NavData[]>([] as NavData[]);

  const configData = {
    menu: [
      {
        label: "API Reference",
        children: [
          {
            label: "QueryClient",
            to: "reference/QueryClient",
          },
          {
            label: "QueryCache",
            to: "reference/QueryCache",
          },
        ],
      },
    ],
  };

  useMemo(() => {
    // Search through the configData and filter the data
    if (search) {
      const filteredData = configData.menu.filter((item) => {
        return item.children.some((child) => {
          return child.label.toLowerCase().includes(search.toLowerCase());
        });
      });

      setFilteredData(filteredData);
    }
  }, [search, data]);

  return (
    <>
      <div className="flex flex-row justify-between">
        <div className="min-h-screen border-r border-r-zinc-600 p-4 w-80">
          <a
            href="/cryptoguard/docs"
            className="text-2xl font-bold mb-4 block"
            style={{ color: "hsl(52, 73%, 56%)" }}
          >
            CryptoGuard
          </a>

          {configData.menu.map((item, index) => (
            <div key={index}>
              <h3 className="text-lg text-gray-200 mt-4">{item.label}</h3>
              <ul className="mt-2">
                {item.children.map((child, index) => (
                  <li key={index}>
                    {location.pathname.includes(child.to) ? (
                      <a
                        href={`/cryptoguard/docs/${child.to}`}
                        style={{
                          //Make it have gradient text color
                          //"hsl(240, 31%, 25%)",
                          //"hsl(52, 73%, 56%)",
                          background:
                            "linear-gradient(90deg, hsl(52, 73%, 56%), hsl(240, 31%, 25%))",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {child.label}
                      </a>
                    ) : (
                      <a
                        href={`/cryptoguard/docs/${child.to}`}
                        className="text-gray-300 hover:text-gray-100"
                      >
                        {child.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {location.pathname === "/cryptoguard/docs" ? (
          <div className="container mx-auto p-4">
            {/* This means no data is found at it is the meaning, this is the front page of the docs. */}
            <h1 className="text-4xl font-bold">CryptoGuard</h1>
            <p>
              CryptoGuard is a library that provides a set of hooks and
              utilities to help you manage your state in a more predictable and
              efficient way.
            </p>

            <input
              type="text"
              className="w-full mt-4 p-4 border rounded-sm border-gray-800 bg-zinc-950 dark:text-white text-black"
              placeholder="Search for"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="mt-4 mb-4" />
            {search && (
              <div className="border rounded-sm border-gray-800 p-4">
                {filteredData.map((item, index) => (
                  <div key={index}>
                    <h3 className="text-lg text-gray-600 mt-4">{item.label}</h3>
                    <ul className="mt-2">
                      {item.children.map((child, index) => (
                        <li key={index}>
                          {location.pathname.includes(child.to) ? (
                            <a
                              href={`/cryptoguard/docs/${child.to}`}
                              style={{
                                //Make it have gradient text color
                                //"hsl(240, 31%, 25%)",
                                //"hsl(52, 73%, 56%)",
                                background:
                                  "linear-gradient(90deg, hsl(52, 73%, 56%), hsl(240, 31%, 25%))",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                              }}
                            >
                              {child.label}
                            </a>
                          ) : (
                            <a
                              href={`/cryptoguard/docs/${child.to}`}
                              className="text-gray-300 hover:text-gray-100"
                            >
                              {child.label}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="container mx-auto markdown p-4">
            <RenderMarkdown>{data?.content}</RenderMarkdown>
          </div>
        )}
      </div>
    </>
  );
}
