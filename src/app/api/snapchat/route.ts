import { NextRequest } from "next/server";
import { success, error } from "@/lib/api";

interface StoryItem {
  url: string;
  thumbnail: string;
  contentUrl: string;
  uploadDate: string;
  description: string;
  encodingFormat?: string;
  mediaType?: "image" | "video";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractValueField(field: any): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && field.value) return String(field.value);
  if (typeof field === "number") return String(field);
  return "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSnapList(snapList: any[]): StoryItem[] {
  if (!Array.isArray(snapList)) return [];

  return snapList
    .filter((snap) => snap && snap.snapUrls)
    .map((snap) => {
      const urls = snap.snapUrls;

      // mediaPreviewUrl can be a string or object with .value
      const thumbnail = extractValueField(urls.mediaPreviewUrl) || extractValueField(urls.mediaUrl);
      const contentUrl = urls.mediaUrl || "";

      // snapMediaType: 0 = image, 1 = video
      const mediaTypeNum = snap.snapMediaType ?? 0;
      const mediaType: "image" | "video" = mediaTypeNum === 1 ? "video" : "image";

      // timestamp can be object with .value or direct number/string
      const timestampRaw = extractValueField(snap.timestampInSec);
      let uploadDate = "";
      if (timestampRaw) {
        try {
          const ts = parseInt(timestampRaw, 10);
          if (!isNaN(ts)) {
            uploadDate = new Date(ts * 1000).toISOString();
          }
        } catch {
          // skip
        }
      }

      return {
        url: contentUrl,
        thumbnail,
        contentUrl,
        uploadDate,
        description: snap.snapId || "",
        encodingFormat: mediaType === "video" ? "video/mp4" : "image/jpeg",
        mediaType,
      };
    })
    .filter((item) => item.contentUrl);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  if (!username) return error("Username required");

  try {
    // Fetch the public profile page
    const res = await fetch(`https://www.snapchat.com/@${username}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    const html = await res.text();

    let stories: StoryItem[] = [];
    let highlights: StoryItem[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let profile: any = null;

    // ── 1. Extract __NEXT_DATA__ (primary method) ──
    const nextDataMatch = html.match(
      /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
    );
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const pageProps = nextData?.props?.pageProps;

        if (pageProps) {
          // Extract profile info
          if (pageProps.userProfile || pageProps.story) {
            const up = pageProps.userProfile || {};
            profile = {
              name: up.displayName || up.username || username,
              image: up.bitmoji?.avatarUrl || up.snapcodeImageUrl || null,
              description: up.bio || "",
              url: `https://snapchat.com/@${username}`,
            };
          }

          // Extract ACTIVE STORIES from props.pageProps.story.snapList[]
          if (pageProps.story?.snapList) {
            stories = parseSnapList(pageProps.story.snapList);
          }

          // Extract HIGHLIGHTS from props.pageProps.curatedHighlights[].snapList[]
          if (Array.isArray(pageProps.curatedHighlights)) {
            for (const highlight of pageProps.curatedHighlights) {
              if (highlight.snapList) {
                highlights.push(...parseSnapList(highlight.snapList));
              }
            }
          }
        }
      } catch {
        // Skip parse errors
      }
    }

    // ── 2. JSON-LD fallback ──
    if (stories.length === 0 && highlights.length === 0) {
      const jsonLdMatches = html.match(
        /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
      );

      if (jsonLdMatches) {
        const jsonLdStories: StoryItem[] = [];

        for (const match of jsonLdMatches) {
          const jsonStr = match
            .replace(/<script[^>]*>/, "")
            .replace(/<\/script>/, "");
          try {
            const data = JSON.parse(jsonStr);

            // Extract profile info
            if (data["@type"] === "ProfilePage" && !profile) {
              profile = {
                name: data.mainEntity?.name || username,
                image: data.mainEntity?.image || null,
                description: data.mainEntity?.description || "",
                url:
                  data.mainEntity?.url ||
                  `https://snapchat.com/@${username}`,
              };
            }

            // Extract stories from ItemList
            if (data["@type"] === "ItemList" && data.itemListElement) {
              const items = data.itemListElement
                .filter(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (item: any) =>
                    item["@type"] === "VideoObject" ||
                    item.item?.["@type"] === "VideoObject" ||
                    item["@type"] === "ImageObject" ||
                    item.item?.["@type"] === "ImageObject"
                )
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((item: any) => {
                  const media =
                    item["@type"] === "VideoObject" ||
                    item["@type"] === "ImageObject"
                      ? item
                      : item.item;
                  return {
                    url: media.url || "",
                    thumbnail: media.thumbnailUrl || "",
                    contentUrl: media.contentUrl || "",
                    uploadDate: media.uploadDate || "",
                    description: media.description || "",
                    encodingFormat: media.encodingFormat || "",
                  };
                });
              jsonLdStories.push(...items);
            }
          } catch {
            // Skip invalid JSON
          }
        }

        // Put JSON-LD items into highlights (since we can't distinguish)
        if (jsonLdStories.length > 0) {
          highlights = jsonLdStories;
        }
      }
    }

    // ── 3. Fallback: extract raw sc-cdn.net URLs ──
    if (stories.length === 0 && highlights.length === 0) {
      const mediaUrls =
        html.match(/https:\/\/cf-st\.sc-cdn\.net\/[^"'\s]+/g) || [];
      const uniqueUrls = [...new Set(mediaUrls)];
      for (const mediaUrl of uniqueUrls.slice(0, 12)) {
        const isVideo =
          mediaUrl.includes("video") || mediaUrl.endsWith(".mp4");
        highlights.push({
          url: `https://snapchat.com/@${username}`,
          thumbnail: isVideo ? "" : mediaUrl,
          contentUrl: mediaUrl,
          uploadDate: "",
          description: "",
          encodingFormat: isVideo ? "video/mp4" : "image/jpeg",
        });
      }
    }

    // Limit: stories to 20, highlights to 12
    stories = stories.slice(0, 20);
    highlights = highlights.slice(0, 12);

    return success({ stories, highlights, profile });
  } catch {
    return error("Failed to fetch Snapchat data", 500);
  }
}
