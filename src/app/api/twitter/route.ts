import { NextRequest, NextResponse } from "next/server";

interface TweetData {
  id: string;
  text: string;
  createdAt: string;
  user: { name: string; username: string; avatar: string };
  likes: number;
  retweets: number;
  media?: { url: string; type: string }[];
}

// In-memory cache — survives across requests within the same container
const cache: Record<string, { tweets: TweetData[]; fetchedAt: number }> = {};
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Missing username parameter" }, { status: 400 });
  }

  const key = username.toLowerCase();

  // Return cached data if fresh
  if (cache[key] && Date.now() - cache[key].fetchedAt < CACHE_TTL) {
    return NextResponse.json({ tweets: cache[key].tweets }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  }

  try {
    const res = await fetch(
      `https://syndication.twitter.com/srv/timeline-profile/screen-name/${encodeURIComponent(username)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: "https://platform.twitter.com/",
          Origin: "https://platform.twitter.com",
        },
      }
    );

    if (!res.ok) {
      // If rate-limited but we have stale cache, serve it
      if (cache[key]) {
        return NextResponse.json({ tweets: cache[key].tweets, stale: true }, {
          headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
        });
      }
      return NextResponse.json({ error: `Twitter returned ${res.status}`, tweets: [] }, { status: 200 });
    }

    const html = await res.text();

    const match = html.match(/<script\s+id="__NEXT_DATA__"\s+type="application\/json">([\s\S]*?)<\/script>/);
    if (!match?.[1]) {
      if (cache[key]) {
        return NextResponse.json({ tweets: cache[key].tweets, stale: true });
      }
      return NextResponse.json({ error: "Could not extract tweet data", tweets: [] }, { status: 200 });
    }

    const nextData = JSON.parse(match[1]);
    const entries = nextData?.props?.pageProps?.timeline?.entries ?? [];

    const tweets: TweetData[] = [];

    for (const entry of entries) {
      if (entry.type !== "tweet" || !entry.content?.tweet) continue;

      const t = entry.content.tweet;

      const media: { url: string; type: string }[] = [];
      const allMedia = [...(t.entities?.media || []), ...(t.extended_entities?.media || [])];
      const seen = new Set<string>();
      for (const m of allMedia) {
        if (m.media_url_https && !seen.has(m.media_url_https)) {
          seen.add(m.media_url_https);
          media.push({ url: m.media_url_https, type: m.type ?? "photo" });
        }
      }

      tweets.push({
        id: t.id_str ?? String(t.id ?? ""),
        text: t.full_text ?? t.text ?? "",
        createdAt: new Date(t.created_at).toISOString(),
        user: {
          name: t.user?.name ?? username,
          username: t.user?.screen_name ?? username,
          avatar: t.user?.profile_image_url_https ?? "",
        },
        likes: t.favorite_count ?? 0,
        retweets: t.retweet_count ?? 0,
        ...(media.length > 0 ? { media } : {}),
      });

      if (tweets.length >= 10) break;
    }

    // Update cache
    cache[key] = { tweets, fetchedAt: Date.now() };

    return NextResponse.json({ tweets }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (err) {
    console.error("Twitter API error:", err);
    // Serve stale cache on error
    if (cache[key]) {
      return NextResponse.json({ tweets: cache[key].tweets, stale: true });
    }
    return NextResponse.json({ error: "Failed to fetch tweets", tweets: [] }, { status: 200 });
  }
}
