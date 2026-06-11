import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { CompareDrawer } from "@/components/listings/CompareDrawer";
import { CookieNotice } from "@/components/ui/CookieNotice";
import { RouteAnnouncer } from "@/components/ui/RouteAnnouncer";

export default function PublicShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-brass-500"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none"><Outlet /></main>
      <Footer />
      <CompareDrawer />
      <CookieNotice />
      <RouteAnnouncer />
    </div>
  );
}
