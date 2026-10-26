import { useId, type ReactNode } from "react";

export function inputClass(extra = "") {
  return `w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 ${extra}`;
}

/** Returns #RRGGBB or null if not exactly 6 hex digits (with optional #). */
export function normalizeHex6(raw: string): string | null {
  const m = raw.trim().match(/^#?([0-9A-Fa-f]{6})$/);
  return m ? `#${m[1].toUpperCase()}` : null;
}

/** Label + optional hint/error wired to its control for screen readers. */
export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: (ids: { id: string; describedBy: string | undefined }) => ReactNode;
}) {
  const id = useId();
  const noteId = hint || error ? `${id}-note` : undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-baseline gap-1.5 text-[10px] font-dmMono uppercase tracking-[0.2em] text-zinc-300">
        {label}
        {required && <span className="text-adminAccent" aria-hidden>*</span>}
        {required && <span className="sr-only">(required)</span>}
      </label>
      {children({ id, describedBy: noteId })}
      {error ? (
        <p id={noteId} className="text-[11px] text-red-300">{error}</p>
      ) : hint ? (
        <p id={noteId} className="text-[11px] leading-relaxed text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  hint?: string;
}) {
  const normalized = normalizeHex6(value);
  return (
    <Field label={label} hint={hint} required error={normalized ? null : "Use 6 digits, like #4CB3FF"}>
      {({ id, describedBy }) => (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={normalized ?? "#3F3F46"}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="admin-color-swatch shrink-0"
            aria-label={`${label}, color picker`}
          />
          <input
            id={id}
            aria-describedby={describedBy}
            aria-invalid={!normalized}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass("min-w-0 flex-1 font-dmMono")}
            placeholder="#RRGGBB"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      )}
    </Field>
  );
}
