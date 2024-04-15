import { ThemeSwitch } from "./ThemeSwitch";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center p-4 border-b dark:border-zinc-900">
      <div className="flex items-center"></div>
      <ThemeSwitch />
    </div>
  );
}
