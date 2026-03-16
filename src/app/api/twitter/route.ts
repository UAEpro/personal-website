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

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Missing username parameter" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://syndication.twitter.com/srv/timeline-profile/screen-name/${encodeURIComponent(username)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Twitter returned ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();

    // Extract __NEXT_DATA__ JSON from the HTML
    const match = html.match(
      /<script\s+id="__NEXT_DATA__"\s+type="application\/json">([\s\S]*?)<\/script>/
    );

    if (!match?.[1]) {
      return NextResponse.json(
        { error: "Could not extract tweet data" },
        { status: 502 }
      );
    }

    const nextData = JSON.parse(match[1]);
    const entries =
      nextData?.props?.pageProps?.timeline?.entries ?? [];

    const tweets: TweetData[] = [];

    for (const entry of entries) {
      if (entry.type !== "tweet" || !entry.content?.tweet) continue;

      const t = entry.content.tweet;

      const media: { url: string; type: string }[] = [];
      if (t.entities?.media) {
        for (const m of t.entities.media) {
          if (m.media_url_https) {
            media.push({
              url: m.media_url_https,
              type: m.type ?? "photo",
            });
          }
        }
      }
      // Also check extended_entities for multiple media
      if (t.extended_entities?.media) {
        for (const m of t.extended_entities.media) {
          if (
            m.media_url_https &&
            !media.some((existing) => existing.url === m.media_url_https)
          ) {
            media.push({
              url: m.media_url_https,
              type: m.type ?? "photo",
            });
          }
        }
      }

      tweets.push({
        id: t.id_str ?? t.id ?? "",
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

    return NextResponse.json({ tweets });
  } catch (err) {
    console.error("Twitter API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch tweets" },
      { status: 500 }
    );
  }
}
