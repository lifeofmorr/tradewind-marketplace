import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ListChecks, Inbox, Save, Users,
  ShieldAlert, CreditCard, FileText, Building2, Wrench, BarChart3,
  MessageSquare, Gavel, Star, Newspaper, BookOpen, Menu, X,
  Code2, Upload,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadConversationCount } from "@/hooks/useConversations";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database";

interface NavItem { to: string; label: string; icon: LucideIcon; end?: boolean }

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  buyer: [
    { to: "/buyer",          label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/buyer/saved",    label: "Saved",    icon: Save },
    { to: "/buyer/requests", label: "Requests", icon: Inbox },
    { to: "/buyer/reviews",  label: "Reviews",  icon: Star },
    { to: "/messages",       label: "Messages", icon: MessageSquare },
  ],
  seller: [
    { to: "/seller",            label: "Overview",  icon: LayoutDashboard, end: true },
    { to: "/seller/listings",   label: "Listings",  icon: ListChecks },
    { to: "/seller/auctions",   label: "Auctions",  icon: Gavel },
    { to: "/seller/inquiries",  label: "Inquiries", icon: Inbox },
    { to: "/messages",          label: "Messages",  icon: MessageSquare },
  ],
  dealer: [
    { to: "/dealer",            label: "Overview",  icon: LayoutDashboard, end: true },
    { to: "/dealer/inventory",  label: "Inventory", icon: ListChecks },
    { to: "/dealer/import",     label: "Import",    icon: Upload },
    { to: "/seller/auctions",   label: "Auctions",  icon: Gavel },
    { to: "/dealer/leads",      label: "Leads",     icon: Inbox },
    { to: "/messages",          label: "Messages",  icon: MessageSquare },
    { to: "/dealer/widgets",    label: "Widgets",   icon: Code2 },
    { to: "/dealer/analytics",  label: "Analytics", icon: BarChart3 },
    { to: "/dealer/profile",    label: "Profile",   icon: Building2 },
  ],
  dealer_staff: [
    { to: "/dealer",           label: "Overview",  icon: LayoutDashboard, end: true },
    { to: "/dealer/inventory", label: "Inventory", icon: ListChecks },
    { to: "/dealer/leads",     label: "Leads",     icon: Inbox },
    { to: "/messages",         label: "Messages",  icon: MessageSquare },
  ],
  service_provider: [
    { to: "/service",         label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/service/leads",   label: "Leads",    icon: Inbox },
    { to: "/messages",        label: "Messages", icon: MessageSquare },
    { to: "/service/profile", label: "Profile",  icon: Wrench },
  ],
  admin: [
    { to: "/admin",                label: "Overview",     icon: LayoutDashboard, end: true },
    { to: "/admin/listings",       label: "Listings",     icon: ListChecks },
    { to: "/admin/auctions",       label: "Auctions",     icon: Gavel },
    { to: "/admin/users",          label: "Users",        icon: Users },
    { to: "/admin/requests",       label: "Requests",     icon: Inbox },
    { to: "/admin/fraud",          label: "Fraud",        icon: ShieldAlert },
    { to: "/admin/payments",       label: "Payments",     icon: CreditCard },
    { to: "/admin/content",        label: "Content",      icon: FileText },
    { to: "/admin/blog",           label: "Blog",         icon: BookOpen },
    { to: "/admin/market-reports", label: "Reports",      icon: Newspaper },
    { to: "/messages",             label: "Messages",     icon: MessageSquare },
  ],
};

function activeLabel(items: NavItem[], pathname: string): string {
  // Pick the longest matching `to` so /seller/listings beats /seller.
  const match = items
    .filter((it) => (it.end ? pathname === it.to : pathname.startsWith(it.to)))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return match?.label ?? "Dashboard";
}

export default function DashboardShell() {
  const { profile, role, signOut } = useAuth();
  const { data: unreadMsgs = 0 } = useUnreadConversationCount();
  const items: NavItem[] = role ? NAV_BY_ROLE[role] : [];
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const currentLabel = activeLabel(items, location.pathname);

  const sidebar = (
    <>
      <Link to="/" className="font-display text-xl px-6 py-6 border-b border-border block">
        {BRAND.name}<span className="text-brass-400">.</span>
      </Link>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) => cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors min-h-[44px]",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
            )}
          >
            <it.icon className="h-4 w-4" />
            <span className="flex-1">{it.label}</span>
            {it.to === "/messages" && unreadMsgs > 0 && (
              <span className="text-[10px] font-mono bg-brass-500 text-navy-950 rounded-full px-1.5 py-0.5">
                {unreadMsgs > 99 ? "99+" : unreadMsgs}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-4 text-xs">
        <div className="text-muted-foreground truncate">{profile?.full_name ?? profile?.email ?? "—"}</div>
        <div className="font-mono text-brass-400 capitalize">{role ?? "—"}</div>
        <button type="button" className="mt-2 text-muted-foreground hover:text-foreground" onClick={() => { void signOut(); }}>
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen md:flex">
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 backdrop-blur px-4 h-14">
        <button
          type="button"
          className="inline-flex items-center justify-center h-11 w-11 -ml-2"
          onClick={() => setOpen(true)}
          aria-label="Open dashboard menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="font-display text-base">{currentLabel}</div>
        <Link to="/" className="font-display text-base">
          {BRAND.name}<span className="text-brass-400">.</span>
        </Link>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <aside className="relative w-72 max-w-[85vw] bg-navy-950 border-r border-border flex flex-col">
            <button
              type="button"
              className="absolute right-2 top-2 inline-flex items-center justify-center h-11 w-11"
              onClick={() => setOpen(false)}
              aria-label="Close dashboard menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-border bg-navy-950/40 flex-col">
        {sidebar}
      </aside>
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
