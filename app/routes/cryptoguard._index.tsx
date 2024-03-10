import { MetaFunction, useLoaderData } from "@remix-run/react";
import DocTitle from "~/components/DocTitle";
import NewVersion from "~/components/NewVersion";
import { GithubBranch } from "~/types/github-branch";
import { userPrefs } from "~/utils/cookies.server";
import { getGithubRelease } from "~/utils/document.server";

export const meta: MetaFunction = () => {
  return [
    { title: "CryptoGuard | CodeVault" },
    {
      name: "description",
      content:
        "CryptoGuard is a versatile encryption and decryption tool designed to provide robust file security.",
    },
  ];
};

export const loader = async ({ request }: { request: Request }) => {
  const getData = async () => {
    const data: GithubBranch[] = await getGithubRelease("query");

    const response = data[0];
    // Check if the thing was published in the last 2 days.
    const published = new Date(response.published_at);
    const now = new Date();
    const diff = now.getTime() - published.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    if (days > 2) {
      return null;
    }

    return response;
  };

  const getCookie = async () => {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = (await userPrefs.parse(cookieHeader)) || {};

    return cookie;
  };

  return {
    data: await getData(),
    cookie: await getCookie(),
  };
};

export default function Index() {
  const {
    data,
    cookie,
  }: { data: GithubBranch; cookie: Record<string, string> } =
    useLoaderData() as unknown as {
      data: GithubBranch;
      cookie: Record<string, string>;
    };

  return (
    <div className="container mx-auto p-4 flex justify-center items-center flex-col">
      {data && <NewVersion data={data} cookie={cookie} />}

      <DocTitle
        title="CryptoGuard"
        description="CryptoGuard is a versatile encryption and decryption tool designed to
        provide robust file security."
        docsLink="/cryptoguard/docs"
        features={[
          "Custom Encryption",
          "CLI Integration",
          "AES-256 Encryption",
          "File Decryption",
        ]}
        colors={["hsl(240, 31%, 25%)", "hsl(52, 73%, 56%)"]}
      />
    </div>
  );
}
