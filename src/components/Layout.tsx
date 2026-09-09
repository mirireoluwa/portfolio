import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { isAdminHostname } from "../config/site";
import { AdminHeader } from "./AdminHeader";
import { Header } from "./Header";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const onAdminHost =
    typeof window !== "undefined" && isAdminHostname(window.location.hostname);
  const isAdmin = onAdminHost || pathname === "/admin";

  return (
    <div className="min-h-screen flex flex-col items-center py-6">
      {/* Header sits outside the padded content column entirely so it's genuinely
          full-bleed on every screen size — no viewport-calc hacks needed.
          Admin keeps its original constrained/padded look, since that's a
          separate CMS surface, not part of the public nav redesign. */}
      <div
        className={`sticky top-0 z-50 w-full ${
          isAdmin ? "mx-auto max-w-6xl px-4 sm:px-6 lg:px-10" : ""
        }`}
      >
        <div
          className={
            isAdmin
              ? "backdrop-blur-sm border-b border-amber-500/20 bg-zinc-950/50"
              : ""
          }
        >
          {isAdmin ? <AdminHeader /> : <Header />}
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-10 px-4 sm:px-6 lg:px-10">
        <main className="mx-auto w-full max-w-5xl flex-1 pb-16">{children}</main>

        <footer className="font-dmMono mx-auto max-w-5xl pb-6 text-xs text-zinc-500 flex justify-between gap-4 flex-wrap">
          {isAdmin ? (
            <>
              <span className="text-amber-500/50 uppercase tracking-[0.16em]">cms session</span>
              <span className="text-zinc-600">not public navigation</span>
            </>
          ) : (
            <span>© {new Date().getFullYear()} Mirireoluwa</span>
          )}
        </footer>
      </div>
    </div>
  );
}


