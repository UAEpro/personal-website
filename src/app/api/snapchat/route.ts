import { NextRequest } from "next/server";
import { success, error } from "@/lib/api";

interface StoryItem {
  url: string;
  thumbnail: string;
  contentUrl: string;
  uploadDate: string;
  description: string;
  encodingFormat?: string;
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

    // Extract JSON-LD structured data from the page
    // The script tag may have extra attributes like data-react-helmet="true"
    const jsonLdMatches = html.match(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
    );

    let stories: StoryItem[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let profile: any = null;

    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        const jsonStr = match
          .replace(/<script[^>]*>/, "")
          .replace(/<\/script>/, "");
        try {
          const data = JSON.parse(jsonStr);

          // Extract profile info
          if (data["@type"] === "ProfilePage") {
            profile = {
              name: data.mainEntity?.name || username,
              image: data.mainEntity?.image || null,
              description: data.mainEntity?.description || "",
              url:
                data.mainEntity?.url || `https://snapchat.com/@${username}`,
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
                  item["@type"] === "VideoObject" || item["@type"] === "ImageObject"
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
            stories = [...stories, ...items];
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }

    // Try to find stories in __NEXT_DATA__ embedded JSON
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        // Navigate props to find story data - Snapchat uses various structures
        const props = nextData?.props?.pageProps;
        if (props) {
          // Look for curatedHighlights, story, snapList patterns
          const findStories = (obj: Record<string, unknown>, depth = 0): StoryItem[] => {
            if (depth > 5 || !obj || typeof obj !== "object") return [];
            const found: StoryItem[] = [];

            if (Array.isArray(obj)) {
              for (const item of obj) {
                if (item && typeof item === "object") {
                  found.push(...findStories(item as Record<string, unknown>, depth + 1));
                }
              }
              return found;
            }

            // Check if this object looks like a snap/story
            const mediaUrl = (obj.mediaUrl || obj.snapMediaUrl || obj.contentUrl) as string | undefined;
            const thumbUrl = (obj.thumbnailUrl || obj.snapThumbnailUrl || obj.thumbUrl) as string | undefined;
            if (mediaUrl && typeof mediaUrl === "string" && mediaUrl.includes("sc-cdn.net")) {
              found.push({
                url: (obj.url as string) || "",
                thumbnail: thumbUrl || "",
                contentUrl: mediaUrl,
                uploadDate: (obj.uploadDate || obj.timestamp || "") as string,
                description: (obj.description || obj.title || "") as string,
                encodingFormat: (obj.encodingFormat || obj.mediaType || "") as string,
              });
            }

            // Recurse into known keys
            const keysToSearch = ["snapList", "stories", "storyMap", "curatedHighlights", "highlights", "snaps", "items", "elements"];
            for (const key of keysToSearch) {
              if (obj[key] && typeof obj[key] === "object") {
                found.push(...findStories(obj[key] as Record<string, unknown>, depth + 1));
              }
            }

            return found;
          };

          const nextStories = findStories(props as Record<string, unknown>);
          if (nextStories.length > 0) {
            // Merge, avoiding duplicates by contentUrl
            const existingUrls = new Set(stories.map((s) => s.contentUrl));
            for (const s of nextStories) {
              if (!existingUrls.has(s.contentUrl)) {
                stories.push(s);
              }
            }
          }
        }
      } catch {
        // Skip
      }
    }

    // Also extract any media URLs from sc-cdn.net as fallback
    if (stories.length === 0) {
      const mediaUrls = html.match(/https:\/\/cf-st\.sc-cdn\.net\/[^"'\s]+/g) || [];
      const uniqueUrls = [...new Set(mediaUrls)];
      for (const mediaUrl of uniqueUrls.slice(0, 12)) {
        const isVideo = mediaUrl.includes("video") || mediaUrl.endsWith(".mp4");
        stories.push({
          url: `https://snapchat.com/@${username}`,
          thumbnail: isVideo ? "" : mediaUrl,
          contentUrl: mediaUrl,
          uploadDate: "",
          description: "",
          encodingFormat: isVideo ? "video/mp4" : "image/jpeg",
        });
      }
    }

    // Limit to 12
    stories = stories.slice(0, 12);

    return success({ stories, profile });
  } catch (e) {
    return error("Failed to fetch Snapchat data", 500);
  }
}
