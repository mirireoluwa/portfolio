const LAST_FM_API = "https://ws.audioscrobbler.com/2.0/";

export async function GET(_request: Request) {
  const apiKey = process.env.LAST_FM_API_KEY;
  const user = process.env.LAST_FM_USER;

  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "s-maxage=60, stale-while-revalidate=30",
  });

  if (!apiKey || !user) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "Last.fm not configured",
        nowPlaying: false,
      }),
      { status: 200, headers }
    );
  }

  try {
    const url = new URL(LAST_FM_API);
    url.searchParams.set("method", "user.getRecentTracks");
    url.searchParams.set("user", user);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString());
    const data = (await response.json()) as {
      error?: number;
      message?: string;
      recenttracks?: {
        track?:
          | Array<{
              name?: string;
              artist?: { "#text"?: string; name?: string };
              album?: { "#text"?: string; name?: string };
              url?: string;
              image?: Array<{ size: string; "#text": string }>;
              "@attr"?: { nowplaying?: string };
            }>
          | {
              name?: string;
              artist?: { "#text"?: string; name?: string };
              album?: { "#text"?: string; name?: string };
              url?: string;
              image?: Array<{ size: string; "#text": string }>;
              "@attr"?: { nowplaying?: string };
            };
      };
    };

    if (data.error) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: data.message || "Last.fm error",
          nowPlaying: false,
        }),
        { status: 200, headers }
      );
    }

    // Last.fm returns track as a single object when limit=1, or array when multiple
    const rawTrack = data.recenttracks?.track;
    const track = Array.isArray(rawTrack) ? rawTrack[0] : rawTrack;
    if (!track || typeof track !== "object" || !track.name) {
      return new Response(
        JSON.stringify({ ok: true, nowPlaying: false, track: null }),
        { status: 200, headers }
      );
    }

    const nowPlaying = track["@attr"]?.nowplaying === "true";
    const image =
      track.image?.find((i) => i.size === "extralarge")?.["#text"] ||
      track.image?.slice(-1)[0]?.["#text"];

    return new Response(
      JSON.stringify({
        ok: true,
        nowPlaying,
        track: {
          name: track.name,
          artist: track.artist?.["#text"] ?? track.artist?.name ?? "Unknown",
          album: track.album?.["#text"] ?? track.album?.name ?? "",
          url: track.url,
          image: image || null,
        },
      }),
      { status: 200, headers }
    );
  } catch (err) {
    console.error("now-playing API error:", err);
    return new Response(
      JSON.stringify({
        ok: false,
        message: "Failed to fetch",
        nowPlaying: false,
      }),
      { status: 200, headers }
    );
  }
}
