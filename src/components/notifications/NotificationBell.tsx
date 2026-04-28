import { Link } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import {
  useNotifications, useUnreadNotificationCount, useMarkAllNotificationsRead,
} from "@/hooks/useNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";

export function NotificationBell() {
  const { data: notifs = [] } = useNotifications(20);
  const { data: unread = 0 } = useUnreadNotificationCount();
  const markRead = useMarkAllNotificationsRead();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-secondary"
          aria-label="notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brass-500 text-navy-950 text-[10px] font-mono font-semibold inline-flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="font-display text-sm">Notifications</div>
          {unread > 0 && (
            <Button size="sm" variant="ghost" onClick={() => markRead.mutate()} disabled={markRead.isPending}>
              <Check className="h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifs.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">No notifications yet.</div>
          ) : (
            <ul>
              {notifs.map((n) => {
                const inner = (
                  <div className={`px-4 py-3 border-b border-border text-sm ${n.read_at ? "" : "bg-secondary/30"}`}>
                    <div className="font-display text-sm leading-snug">{n.title}</div>
                    {n.body && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</p>}
                    <div className="text-[10px] font-mono text-muted-foreground mt-1">{timeAgo(n.created_at)} ago</div>
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.link ? <Link to={n.link} className="block hover:bg-secondary/40">{inner}</Link> : inner}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
