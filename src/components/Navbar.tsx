import { Link } from "@tanstack/react-router";
import { ThemeSwitch } from "./ThemeSwitch";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center p-4 border-b dark:border-zinc-900">
      <Link to="/" className="text-xl font-bold">
        CryptoGuard
      </Link>
      <div className="flex items-center" />
      <ThemeSwitch />
    </div>
  );
}
