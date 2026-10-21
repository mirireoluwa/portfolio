import { isAdminHostname } from "../config/site";

/**
 * Cookie-less first-party analytics client. Sends one anonymous random id
 * (kept in localStorage) so unique visitors can be counted — no IPs, no
 * third parties. Owner visits are skipped once signed in to /admin.
 */
const VID_KEY = "pf_vid";
const OPT_OUT_KEY = "pf_notrack";

function shouldSkip(): boolean {
  if (typeof window === "undefined") return true;
  if (isAdminHostname(window.location.hostname)) return true;
  if (window.location.pathname.startsWith("/admin")) return true;
  try {
    return localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

export function excludeThisBrowser(): void {
  try {
    localStorage.setItem(OPT_OUT_KEY, "1");
  } catch {
    /* storage unavailable — nothing to do */
  }
}

function visitor(): { vid: string; isNew: boolean } {
  try {
    const existing = localStorage.getItem(VID_KEY);
    if (existing) return { vid: existing, isNew: false };
    const vid = crypto.randomUUID();
    localStorage.setItem(VID_KEY, vid);
    return { vid, isNew: true };
  } catch {
    return { vid: "", isNew: false };
  }
}

function browserName(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

function referrerHost(): string {
  try {
    if (!document.referrer) return "direct";
    const host = new URL(document.referrer).hostname.replace(/^www\./, "");
    return host === window.location.hostname.replace(/^www\./, "") ? "direct" : host;
  } catch {
    return "direct";
  }
}

function send(body: Record<string, unknown>) {
  const json = JSON.stringify(body);
  try {
    if (navigator.sendBeacon?.("/api/track", new Blob([json], { type: "application/json" }))) return;
    void fetch("/api/track", { method: "POST", body: json, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
  } catch {
    /* analytics must never break the page */
  }
}

let lastView = "";

export function trackView(path: string): void {
  if (shouldSkip() || path === lastView) return;
  lastView = path;
  const { vid, isNew } = visitor();
  const ua = navigator.userAgent;
  send({
    type: "view",
    path,
    ref: referrerHost(),
    vid,
    isNew,
    device: /mobi|android|iphone/i.test(ua) || window.innerWidth < 768 ? "mobile" : "desktop",
    browser: browserName(ua),
  });
}

export function trackEvent(name: string): void {
  if (shouldSkip()) return;
  send({ type: "event", name });
}
