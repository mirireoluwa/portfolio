import type { ReactNode } from "react";

const LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

/** Plain text with blank-line paragraphs and [label](https://…) links. Nothing else is interpreted. */
export function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((para, i) => {
        const parts: ReactNode[] = [];
        let last = 0;
        for (const m of para.matchAll(LINK)) {
          if (m.index! > last) parts.push(para.slice(last, m.index));
          parts.push(
            <a
              key={`${i}-${m.index}`}
              href={m[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-50 underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
            >
              {m[1]}
            </a>
          );
          last = m.index! + m[0].length;
        }
        if (last < para.length) parts.push(para.slice(last));
        return (
          <p key={i} className={className}>
            {parts}
          </p>
        );
      })}
    </>
  );
}
