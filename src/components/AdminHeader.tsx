import { Link } from "react-router-dom";

function CmsGlyph() {
  return (
    <svg
      className="h-4 w-4 text-amber-400/90"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function AdminHeader() {
  return (
    <header className="relative px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-apple-sm bg-amber-500/10 border border-amber-500/25"
          aria-hidden
        >
          <CmsGlyph />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-dmMono uppercase tracking-[0.22em] text-amber-500/90">
            admin / cms
          </p>
          <p className="text-sm font-semibold text-zinc-50 tracking-tight truncate lowercase">
            portfolio content
          </p>
        </div>
      </div>
      <Link
        to="/"
        className="shrink-0 rounded-apple-sm border border-white/12 bg-white/5 px-3 py-2 text-[10px] font-dmMono uppercase tracking-[0.14em] text-zinc-300 hover:bg-white/10 hover:text-zinc-100 transition-colors"
      >
        view site
      </Link>
    </header>
  );
}
