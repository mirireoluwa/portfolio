const LAST_FM_API = "https://ws.audioscrobbler.com/2.0/";

export default async function handler(
  _req: { method?: string },
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { json: (body: object) => void };
  }
) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");

  const apiKey = process.env.LAST_FM_API_KEY;
  const user = process.env.LAST_FM_USER;

  if (!apiKey || !user) {
    return res.status(200).json({
      ok: false,
      message: "Last.fm not configured",
      nowPlaying: false,
    });
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
      return res.status(200).json({
        ok: false,
        message: data.message || "Last.fm error",
        nowPlaying: false,
      });
    }

    // Last.fm returns track as a single object when limit=1, or array when multiple
    const rawTrack = data.recenttracks?.track;
    const track = Array.isArray(rawTrack) ? rawTrack[0] : rawTrack;
    if (!track || typeof track !== "object" || !track.name) {
      return res.status(200).json({ ok: true, nowPlaying: false, track: null });
    }

    const nowPlaying = track["@attr"]?.nowplaying === "true";
    const image =
      track.image?.find((i) => i.size === "extralarge")?.["#text"] ||
      track.image?.slice(-1)[0]?.["#text"];

    return res.status(200).json({
      ok: true,
      nowPlaying,
      track: {
        name: track.name,
        artist: track.artist?.["#text"] ?? track.artist?.name ?? "Unknown",
        album: track.album?.["#text"] ?? track.album?.name ?? "",
        url: track.url,
        image: image || null,
      },
    });
  } catch (err) {
    console.error("now-playing API error:", err);
    return res.status(200).json({
      ok: false,
      message: "Failed to fetch",
      nowPlaying: false,
    });
  }
}
