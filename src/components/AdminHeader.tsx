import { getPublicSiteUrl } from "../config/site";

export function AdminHeader() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <a
          href="/"
          className="flex items-center gap-1.5 text-lg font-semibold tracking-tight text-zinc-50"
          aria-label="mirireoluwa admin home"
        >
          mirireoluwa
          <span className="mt-1.5 h-2 w-2 rounded-[2px] bg-adminAccent" aria-hidden />
        </a>
        <span className="rounded-full border border-white/15 px-2.5 py-1 text-[9px] font-dmMono uppercase tracking-[0.18em] text-zinc-300">
          admin
        </span>
      </div>
      <a
        href={getPublicSiteUrl()}
        className="shrink-0 rounded-sm py-2 text-[10px] font-dmMono uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:text-white"
      >
        view site ↗
      </a>
    </header>
  );
}
