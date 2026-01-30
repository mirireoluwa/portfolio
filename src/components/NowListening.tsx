import { useEffect, useState } from "react";

interface Track {
  name: string;
  artist: string;
  album: string;
  url: string | null;
  image: string | null;
  /** When provided (e.g. from a source that supports it), display live/animated artwork; otherwise use static image */
  liveArtworkUrl?: string | null;
}

interface NowPlayingResponse {
  ok: boolean;
  nowPlaying: boolean;
  track: Track | null;
  message?: string;
}

export function NowListening() {
  const [data, setData] = useState<NowPlayingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchNowPlaying() {
      try {
        const base =
          import.meta.env.DEV && !import.meta.env.VITE_USE_API
            ? ""
            : window.location.origin;
        const res = await fetch(`${base}/api/now-playing`);
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          if (!cancelled) {
            setData({
              ok: false,
              nowPlaying: false,
              track: null,
              message: "API returned non-JSON (route may not be active)",
            });
          }
          return;
        }
        const json = (await res.json()) as NowPlayingResponse;
        if (!cancelled) {
          setData(json);
        }
      } catch {
        if (!cancelled) {
          setData({
            ok: false,
            nowPlaying: false,
            track: null,
            message: "Could not load (fetch failed)",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 60 * 1000); // refresh every minute
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <section id="listening" className="space-y-8" aria-label="Now listening">
        <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
          <p>.now listening</p>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>
        <div className="flex items-center gap-6 rounded-lg border border-white/10 bg-zinc-900/60 p-6">
          <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-lg bg-zinc-800" />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="h-4 w-32 animate-pulse rounded bg-zinc-700" />
            <div className="h-3 w-24 animate-pulse rounded bg-zinc-800" />
          </div>
        </div>
      </section>
    );
  }

  const hasTrack = data?.ok && data.track;
  const nowPlaying = data?.nowPlaying ?? false;

  return (
    <section id="listening" className="space-y-8" aria-label="Now listening">
      <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
        <p>.now listening</p>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      {!hasTrack ? (
        <div className="rounded-lg border border-white/10 bg-zinc-900/60 p-6 text-center text-sm text-zinc-500">
          {data?.message === "Last.fm not configured" ? (
            <p>
              Connect your Last.fm account to show what you’re listening to.
              <br />
              <span className="text-xs">
                Set <code className="rounded bg-zinc-800 px-1">LAST_FM_API_KEY</code> and{" "}
                <code className="rounded bg-zinc-800 px-1">LAST_FM_USER</code> in your
                Vercel project; scrobble from Apple Music via Last.fm (see README).
              </span>
            </p>
          ) : data?.ok && !data.track ? (
            <p>
              No recent tracks yet. Play something and scrobble to Last.fm to see it here.
            </p>
          ) : data?.message ? (
            <p>{data.message}</p>
          ) : (
            <p>Nothing to show right now.</p>
          )}
        </div>
      ) : (
        <a
          href={data.track!.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group block w-full"
        >
          {/* Card wrapper: full width so background and border wrap entire row */}
          <div className="relative w-full overflow-hidden rounded-lg border border-white/10 bg-zinc-900/60 p-6 transition-colors group-hover:border-white/20 group-hover:bg-zinc-800/60">
            {/* Ambient background from artwork when static image is available */}
            {data.track!.image && (
              <>
                <div
                  className="absolute top-0 left-0 right-0 bottom-0 z-0"
                  style={{
                    backgroundImage: `url(${data.track!.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(48px) saturate(1.4) brightness(0.5)",
                    transform: "scale(1.15)",
                  }}
                  aria-hidden
                />
                <div className="absolute top-0 left-0 right-0 bottom-0 z-0 bg-zinc-900/70" aria-hidden />
              </>
            )}
            <div className="relative z-10 flex w-full items-center gap-6">
              {data.track!.liveArtworkUrl ? (
                <video
                  src={data.track!.liveArtworkUrl}
                  className="h-20 w-20 flex-shrink-0 rounded-lg object-cover shadow-lg ring-1 ring-black/20"
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-hidden
                />
              ) : data.track!.image ? (
                <img
                  src={data.track!.image}
                  alt=""
                  className="h-20 w-20 flex-shrink-0 rounded-lg object-cover shadow-lg ring-1 ring-black/20"
                />
              ) : (
                <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-zinc-700" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  {nowPlaying ? "Now listening" : "Last listened to"}
                </p>
                <p className="mt-1 truncate text-lg font-medium text-zinc-100 group-hover:text-white">
                  {data.track!.name}
                </p>
                <p className="truncate text-sm text-zinc-400">
                  {data.track!.artist}
                  {data.track!.album ? ` · ${data.track!.album}` : ""}
                </p>
              </div>
              <span className="flex-shrink-0 text-zinc-500 transition-colors group-hover:text-zinc-300">
                →
              </span>
            </div>
          </div>
        </a>
      )}
    </section>
  );
}
