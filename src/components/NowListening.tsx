import { useEffect, useState } from "react";

interface Track {
  name: string;
  artist: string;
  album: string;
  url: string | null;
  image: string | null;
}

interface NowPlayingResponse {
  ok: boolean;
  nowPlaying: boolean;
  track: Track | null;
  message?: string;
}

function CdIcon({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: 80, height: 80 }}
      aria-hidden
    >
      {/* CD disc - silver ring with dark center (label area) */}
      <div
        className={`absolute inset-0 rounded-full border-[10px] border-zinc-500 shadow-lg ${
          isPlaying ? "animate-cd-spin" : ""
        }`}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #18181b 0%, #18181b 28%, #3f3f46 30%, #52525b 35%, #71717a 50%, #52525b 65%, #3f3f46 70%, #18181b 72%, #18181b 100%)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-5 rounded-full border-2 border-zinc-600 bg-zinc-900 shadow-inner" />
        </div>
      </div>
    </div>
  );
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
            message: "Unavailable",
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
          <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-full bg-zinc-800" />
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
                Vercel project, and scrobble from Apple Music via Last.fm.
              </span>
            </p>
          ) : data?.ok && !data.track ? (
            <p>
              No recent tracks yet. Play something and scrobble to Last.fm (e.g. with Marvis Pro or Soor) to see it here.
            </p>
          ) : (
            <p>Nothing to show right now.</p>
          )}
        </div>
      ) : (
        <a
          href={data.track!.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-6 rounded-lg border border-white/10 bg-zinc-900/60 p-6 transition-colors hover:bg-zinc-800/60"
        >
          <CdIcon isPlaying={nowPlaying} />
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
          {data.track!.image && (
            <img
              src={data.track!.image}
              alt=""
              className="h-14 w-14 flex-shrink-0 rounded object-cover"
            />
          )}
          <span className="flex-shrink-0 text-zinc-500 transition-colors group-hover:text-zinc-300">
            →
          </span>
        </a>
      )}
    </section>
  );
}
