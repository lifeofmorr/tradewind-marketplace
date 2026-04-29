import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X, User as UserIcon, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadConversationCount } from "@/hooks/useConversations";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import AppSwitcher from "@/components/layout/AppSwitcher";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/database";

const NAV_LINKS = [
  { to: "/browse", label: "Browse" },
  { to: "/categories", label: "Categories" },
  { to: "/dealers", label: "Dealers" },
  { to: "/services", label: "Services" },
  { to: "/community", label: "Community" },
  { to: "/concierge", label: "Concierge" },
  { to: "/integrations", label: "Integrations" },
  { to: "/sell", label: "Sell" },
];

export function dashboardPathFor(role: UserRole | null | undefined): string {
  switch (role) {
    case "admin": return "/admin";
    case "dealer":
    case "dealer_staff": return "/dealer";
    case "service_provider": return "/service";
    case "seller": return "/seller";
    case "buyer": return "/buyer";
    default: return "/buyer";
  }
}

export default function Header() {
  const { user, profile, role, signOut } = useAuth();
  const { data: unreadMsgs = 0 } = useUnreadConversationCount();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="container-pad flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-xl tracking-tight">
          {BRAND.name}<span className="text-brass-400">.</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => cn(
                "text-muted-foreground hover:text-foreground transition-colors",
                isActive && "text-foreground",
              )}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <AppSwitcher />
          {user ? (
            <>
              <Link
                to="/messages"
                className="relative inline-flex items-center justify-center h-11 w-11 md:h-9 md:w-9 rounded-md hover:bg-secondary"
                aria-label={unreadMsgs > 0 ? `${unreadMsgs} unread messages` : "messages"}
              >
                <MessageSquare className="h-4 w-4" />
                {unreadMsgs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brass-500 text-navy-950 text-[10px] font-mono font-semibold inline-flex items-center justify-center">
                    {unreadMsgs > 99 ? "99+" : unreadMsgs}
                  </span>
                )}
              </Link>
              <NotificationBell />
              <Button asChild variant="ghost" size="sm">
                <Link to={dashboardPathFor(role)} className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  {profile?.full_name?.split(" ")[0] ?? "Account"}
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => { void signOut(); }}>Sign out</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/login">Log in</Link></Button>
              <Button asChild size="sm"><Link to="/signup">Sign up</Link></Button>
            </>
          )}
        </div>
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center h-11 w-11 -mr-2"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container-pad flex flex-col py-2 text-sm">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-3 px-1 text-base text-muted-foreground hover:text-foreground border-b border-border/40 last:border-0"
              >
                {l.label}
              </Link>
            ))}
            {user && (
              <Link
                to="/messages"
                onClick={() => setOpen(false)}
                className="py-3 px-1 text-base text-muted-foreground hover:text-foreground border-b border-border/40 flex items-center justify-between"
              >
                <span>Messages</span>
                {unreadMsgs > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-brass-500 text-navy-950 text-[10px] font-mono font-semibold inline-flex items-center justify-center">
                    {unreadMsgs > 99 ? "99+" : unreadMsgs}
                  </span>
                )}
              </Link>
            )}
            <div className="flex items-center gap-2 pt-3 pb-1">
              {user ? (
                <>
                  <Button asChild variant="ghost" className="flex-1">
                    <Link to={dashboardPathFor(role)} onClick={() => setOpen(false)}>Account</Link>
                  </Button>
                  <Button variant="outline" onClick={() => { setOpen(false); void signOut(); }}>Sign out</Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" className="flex-1">
                    <Link to="/login" onClick={() => setOpen(false)}>Log in</Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link to="/signup" onClick={() => setOpen(false)}>Sign up</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
