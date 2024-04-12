import { Outlet, useLocation } from "@remix-run/react";
import Footer from "~/components/Footer";
import Navbar from "~/components/Navbar";

export default function Layout() {
  const location = useLocation();
  const isHomepage = location.pathname === "/";

  return (
    <div className="dark:bg-zinc-950 dark:text-white text-black min-h-screen grid grid-cols-1 md:grid-cols-layout">
      {/* Sidebar (conditionally rendered) */}
      {!isHomepage && (
        <div className="md:col-span-1">
          <h1>Hello World</h1>
        </div>
      )}
      {/* Main content */}
      <div className="md:col-span-2 flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}
