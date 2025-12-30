import { ReactNode } from "react";
import { Header } from "./Header";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 sm:px-6 lg:px-10 py-6">
      <div className="w-full max-w-6xl flex flex-col gap-10">
        {/* Sticky top navigation with only a bottom border */}
        <div className="sticky top-0 z-50 mx-auto max-w-5xl w-full">
          <div className="backdrop-blur-sm border-b border-white/10">
            <Header />
          </div>
        </div>

        <main className="mx-auto max-w-5xl flex-1 pb-16">{children}</main>

        <footer className="font-dmMono mx-auto max-w-5xl pb-6 text-xs text-zinc-500 flex justify-between gap-4 flex-wrap">
          <span>© {new Date().getFullYear()} Mirireoluwa</span>
        </footer>
      </div>
    </div>
  );
}


