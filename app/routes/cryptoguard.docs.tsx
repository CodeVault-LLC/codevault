import { Link, MetaFunction } from "@remix-run/react";
import { CiStar } from "react-icons/ci";
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

export default function Index() {
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
          <Button variant="secondary" asChild>
            <Link
              to="https://github.com/CodeVault-LLC/codevault"
              className="flex flex-row items-center gap-2"
              target="_blank"
              rel="noreferrer"
            >
              <FaGithub className="size-6" />
              <span>GitHub</span>
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-9" />
          <Button variant="secondary">Download</Button>
        </div>
      </div>
      <hr className="my-4" />
      <Card>
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
  );
}
