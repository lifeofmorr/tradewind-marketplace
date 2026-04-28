import { Link, NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, ListChecks, Inbox, Save, Users,
  ShieldAlert, CreditCard, FileText, Building2, Wrench, BarChart3,
  MessageSquare, Gavel, Star, Newspaper, BookOpen,
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
    { to: "/seller/auctions",   label: "Auctions",  icon: Gavel },
    { to: "/dealer/leads",      label: "Leads",     icon: Inbox },
    { to: "/messages",          label: "Messages",  icon: MessageSquare },
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

export default function DashboardShell() {
  const { profile, role, signOut } = useAuth();
  const { data: unreadMsgs = 0 } = useUnreadConversationCount();
  const items: NavItem[] = role ? NAV_BY_ROLE[role] : [];

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-border bg-navy-950/40 flex flex-col">
        <Link to="/" className="font-display text-xl px-6 py-6 border-b border-border">
          {BRAND.name}<span className="text-brass-400">.</span>
        </Link>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) => cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
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
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
