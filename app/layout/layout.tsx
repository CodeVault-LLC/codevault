import { Outlet } from "@remix-run/react";
import Footer from "~/components/Footer";
import Navbar from "~/components/Navbar";

export default function Layout() {
  return (
    <div className="dark:bg-dark-theme dark:text-white min-h-screen">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
