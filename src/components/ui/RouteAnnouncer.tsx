import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Assistive-tech route-change support for the SPA:
 *
 * 1. Moves keyboard focus to the `#main-content` landmark on every pathname
 *    change (client-side navigations don't reset focus by themselves, so a
 *    screen-reader user would otherwise be left mid-page on the old view).
 * 2. Announces the new page title in a polite live region.
 *
 * Only the pathname triggers it — query-param updates (e.g. `?page=2`
 * pagination, which has its own `aria-live` page indicator) keep focus where
 * the user is working.
 */
export function RouteAnnouncer() {
  const { pathname } = useLocation();
  const [announcement, setAnnouncement] = useState("");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      // Initial document load: the browser/AT announces the page itself.
      isFirstRender.current = false;
      return;
    }
    const main = document.getElementById("main-content");
    if (main) {
      main.focus({ preventScroll: true });
    }
    // Defer so the new route has rendered and setMeta() has run.
    const t = setTimeout(() => {
      setAnnouncement(document.title || "Page loaded");
    }, 60);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );
}
