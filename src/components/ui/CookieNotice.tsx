import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Cookie } from "lucide-react";

const STORAGE_KEY = "tw_cookie_ack_v1";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // Storage may be disabled — banner will reappear next visit; fine.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 rounded-lg border border-border bg-card/95 backdrop-blur shadow-lg p-4 text-sm"
    >
      <div className="flex items-start gap-3">
        <Cookie className="h-4 w-4 text-brass-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p>
            We use essential cookies to keep you signed in and a small amount of analytics
            to improve the marketplace. See our{" "}
            <Link to="/privacy" className="underline">Privacy Policy</Link> for details.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={dismiss}
              className="px-3 py-1.5 rounded-md bg-brass-500 text-navy-950 text-xs font-display"
            >
              Got it
            </button>
            <Link
              to="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Learn more
            </Link>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss cookie notice"
          onClick={dismiss}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
