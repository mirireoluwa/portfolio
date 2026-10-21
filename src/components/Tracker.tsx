import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent, trackView } from "../lib/track";

/** Pageviews per route + clicks on anything marked data-track="name". */
export function Tracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    trackView(pathname);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-track]");
      const name = el?.getAttribute("data-track");
      if (name) trackEvent(name);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
