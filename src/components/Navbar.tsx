import { Link } from "@tanstack/react-router";
import { ThemeSwitch } from "./theme-switcher";
import { Button } from "./ui/button";
import { Github } from "lucide-react";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center p-4 border-b dark:border-zinc-900 px-24">
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
      </div>
    </div>
  );
}
