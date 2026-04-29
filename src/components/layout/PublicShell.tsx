import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { CompareDrawer } from "@/components/listings/CompareDrawer";
import { CookieNotice } from "@/components/ui/CookieNotice";

export default function PublicShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <CompareDrawer />
      <CookieNotice />
    </div>
  );
}
