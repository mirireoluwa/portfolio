/**
 * Admin on a subdomain (e.g. admin.mirireoluwa.com):
 * - Add DNS + domain in Vercel (see README).
 * - Optional: set VITE_ADMIN_HOSTNAME=admin.mirireoluwa.com for an exact match.
 * - If unset, any hostname starting with "admin." is treated as the CMS host.
 */

export function isAdminHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  const explicit = import.meta.env.VITE_ADMIN_HOSTNAME?.trim().toLowerCase();
  if (explicit) return h === explicit;
  return h.startsWith("admin.");
}

/** Main portfolio origin for links from the CMS (view site, back home). */
export function getPublicSiteUrl(): string {
  const explicit = import.meta.env.VITE_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  if (typeof window === "undefined") return "/";

  const { protocol, hostname, origin } = window.location;
  const h = hostname.toLowerCase();
  if (h.startsWith("admin.")) {
    return `${protocol}//${hostname.slice("admin.".length)}`;
  }
  return origin;
}
