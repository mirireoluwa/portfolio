import { useState } from "react";
import type { SiteExperience } from "../types/site";

const PREVIEW = 2;

function Entry({ item }: { item: SiteExperience }) {
  const [open, setOpen] = useState(false);
  const extra = Math.max(0, item.bullets.length - PREVIEW);
  const shown = open ? item.bullets : item.bullets.slice(0, PREVIEW);
  const listId = `exp-${item.id}`;

  return (
    <li className="grid gap-3 border-t border-white/10 py-7 md:grid-cols-[150px_minmax(0,1fr)] md:gap-10">
      <p className="font-dmMono text-[11px] uppercase tracking-[0.18em] text-zinc-400 md:pt-1.5">{item.period}</p>

      <div className="min-w-0">
        <h3 className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">{item.title}</h3>
        <p className="mt-1.5 flex items-center gap-2 text-sm text-zinc-300">
          <span className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: item.accentColor }} aria-hidden />
          {item.company}
        </p>

        {item.bullets.length > 0 && (
          <ul id={listId} className="mt-5 space-y-3">
            {shown.map((b, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                <span className="mt-[0.7em] h-px w-3 shrink-0 bg-zinc-500" aria-hidden />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {extra > 0 && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={listId}
            className="mt-4 rounded-sm py-1 font-dmMono text-[11px] uppercase tracking-[0.16em] text-zinc-400 transition-colors hover:text-zinc-100"
          >
            {open ? "show less" : `+ ${extra} more`}
          </button>
        )}
      </div>
    </li>
  );
}

export function ExperienceSection({ items }: { items: SiteExperience[] }) {
  return (
    <ol className="border-b border-white/10">
      {items.map((item) => (
        <Entry key={item.id} item={item} />
      ))}
    </ol>
  );
}
