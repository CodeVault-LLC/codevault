import { Link } from "@tanstack/react-router";
import React from "react";
import { Github } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeSwitch } from "./ThemeSwitch";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { useMe } from "@/gql/gpl";

export const Navbar: React.FC = () => {
  const { data } = useMe({ id: true, username: true, email: true, role: true });

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b dark:border-zinc-900">
      {data?.role === "admin" ? (
        <>
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </>
      ) : null}
      <div className="flex justify-between items-center w-full">
        <div className="flex flex-row items-center justify-between gap-4">
          <img src="/favicon.svg" alt="CodeVault" className="w-12 h-12" />

          <Link to="/" className="text-xl font-bold">
            CodeVault
          </Link>
        </div>

        <div className="flex items-center" />
        <div className="flex flex-row items-center justify-between gap-4">
          <a
            href="https://github.com/CodeVault-LLC"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Button
              variant="ghost"
              className="flex flex-row items-center gap-2"
              size="icon"
            >
              <Github size={24} className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </a>

          <ThemeSwitch />

          {data ? (
            <Link to="/dashboard">
              <Button variant="ghost">
                <img
                  src={data.avatarUrl}
                  alt="Users id"
                  className="w-8 h-8 rounded-full"
                />
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
