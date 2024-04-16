import { Link, MetaFunction, useLoaderData } from "@remix-run/react";
import { CiStar } from "react-icons/ci";
import { GoDownload, GoShield, GoIssueOpened } from "react-icons/go";
import { FaGithub } from "react-icons/fa6";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { getGithubFiles } from "~/utils/github.server";

export const loader = async () => {
  const data = await getGithubFiles();

  if (!data) {
    return {
      status: 404,
      error: new Error("No data found"),
    };
  }

  return {
    githubFiles: data,
  };
};

export const meta: MetaFunction = () => {
  return [
    { title: "CryptoGuard Documentation | CodeVault" },
    {
      name: "description",
      content:
        "CryptoGuard is a versatile encryption and decryption tool designed to provide robust file security.",
    },
  ];
};

interface Sosial {
  name: string;
  icon: JSX.Element;
  link: string;

  issue?: boolean;
}

export default function Index() {
  const socials: Sosial[] = [
    {
      name: "GitHub",
      icon: <FaGithub className="size-6" />,
      link: "https://github.com/CodeVault-LLC/codevault",
    },
    {
      name: "Report Issue",
      icon: <GoIssueOpened className="size-6" />,
      link: "https://github.com/CodeVault-LLC/codevault/issues/new",
    },
    {
      name: "Download",
      icon: <GoDownload className="size-6" />,
      link: "#",

      issue: true,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { githubFiles }: { githubFiles: any } = useLoaderData();
  console.log(githubFiles);

  return (
    <div className="w-full">
      <div className="flex flex-row justify-between gap-2 items-center">
        <div className="flex flex-row items-center gap-2">
          <img
            src="https://avatars.githubusercontent.com/u/160372018?s=48&v=4"
            alt="CryptoGuard Logo"
            className="w-8 h-8 rounded-md"
          />
          <h3 className="text-2xl font-bold text-center">CryptoGuard</h3>
        </div>

        <div className="flex flex-row items-center gap-2 h-full">
          {socials.map((social, index) => (
            <>
              <Button
                key={index}
                variant="secondary"
                asChild
                className={cn(
                  social.issue
                    ? "cursor-not-allowed bg-yellow-600 hover:bg-yellow-700"
                    : "cursor-pointer"
                )}
              >
                <Link
                  to={social.link}
                  className="flex flex-row items-center gap-2"
                  target="_blank"
                  rel="noreferrer"
                >
                  {social.issue ? <GoShield className="size-6" /> : social.icon}
                  <span>{social.name}</span>
                </Link>
              </Button>
              {index !== socials.length - 1 && (
                <Separator orientation="vertical" className="h-9" />
              )}
            </>
          ))}
        </div>
      </div>
      <hr className="my-4" />
      <div className="grid grid-cols-6 w-full gap-4">
        <div className="col-span-4 w-full">
          <h3 className="text-xl font-bold">Name</h3>
          <Table>
            <TableHead>
              <TableHeader>Name</TableHeader>
              <TableHeader></TableHeader>
            </TableHead>

            {githubFiles.tree.map((file: { path: string }, index: number) => (
              <TableBody key={index}>
                <TableRow>
                  <TableCell>{file.path}</TableCell>
                  <TableCell>
                    <Button variant="secondary" asChild>
                      <Link to={`/cryptoguard/docs/${file.path}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            ))}
          </Table>
        </div>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Open Source</CardTitle>
            <CardDescription>
              Beautifully designed components that you can copy and paste into
              your apps. Accessible. Customizable. Open Source.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-row gap-4 items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <div className="w-4 h-4 border border-blue-500 rounded-full" />
              <span>Typescript</span>
            </div>

            <div className="flex flex-row items-center gap-2">
              <CiStar className="size-6" />
              <span>1.2k</span>
            </div>

            <div className="flex flex-row items-center gap-2">
              <span>Updated April 2023</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
