import { Outlet } from "@remix-run/react";
import { CookieRequest } from "~/components/CookieRequest";
import Footer from "~/components/Footer";
import Navbar from "~/components/Navbar";

export default function Layout() {
  return (
    <div className="dark:bg-zinc-950 dark:text-white text-black min-h-screen grid grid-cols-1 md:grid-cols-layout">
      <div className="md:col-span-2 flex flex-col">
        <Navbar />
        <div className="flex flex-1 container mx-auto mt-8 w-full">
          <Outlet />
        </div>
        <Footer />
      </div>

      <CookieRequest />
    </div>
  );
}
