import { Link } from "@tanstack/react-router";
import React from "react";
import { Github } from "lucide-react";
import { useCurrentUser } from "@/client/hooks/useUser";
import { Button } from "./ui/button";
import { ThemeSwitch } from "./ThemeSwitch";

export const Navbar: React.FC = () => {
  const { data } = useCurrentUser();

  return (
    <div className="flex justify-between items-center p-4 border-b dark:border-zinc-900 px-24">
      <Link to="/" className="text-xl font-bold">
        CodeVault
      </Link>
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
  );
};
