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
    <div className="min-h-screen flex flex-col items-center px-4 sm:px-6 lg:px-10 py-6">
      <div className="w-full max-w-6xl flex flex-col gap-10">
        <div className="sticky top-0 z-50 mx-auto max-w-5xl w-full">
          <div
            className={
              isAdmin
                ? "backdrop-blur-sm border-b border-amber-500/20 bg-zinc-950/50"
                : "backdrop-blur-sm border-b border-white/10"
            }
          >
            {isAdmin ? <AdminHeader /> : <Header />}
          </div>
        </div>

        <main className="mx-auto max-w-5xl flex-1 pb-16">{children}</main>

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


