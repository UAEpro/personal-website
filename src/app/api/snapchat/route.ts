import { NextRequest } from "next/server";
import { success, error } from "@/lib/api";

interface SnapItem {
  thumbnail: string;
  contentUrl: string;
  uploadDate: string;
  mediaType: "image" | "video";
  link?: string;
}

interface HighlightGroup {
  title: string;
  thumbnail: string;
  snaps: SnapItem[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function val(field: any): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && field.value) return String(field.value);
  return String(field);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSnaps(snapList: any[]): SnapItem[] {
  if (!Array.isArray(snapList)) return [];
  return snapList
    .filter((s) => s?.snapUrls)
    .map((s) => {
      const urls = s.snapUrls;
      const thumbnail = val(urls.mediaPreviewUrl) || val(urls.mediaUrl);
      const contentUrl = urls.mediaUrl || "";
      const mediaType: "image" | "video" = s.snapMediaType === 1 ? "video" : "image";
      let uploadDate = "";
      const ts = val(s.timestampInSec);
      if (ts) {
        const n = parseInt(ts, 10);
        if (!isNaN(n)) uploadDate = new Date(n * 1000).toISOString();
      }
      // Extract attached link if present
      const link =
        val(s.longformVideoProperties?.storyToVideoLink) ||
        val(s.storyMediaAttachment?.attachmentUrl) ||
        val(s.shareUrl) ||
        val(s.actionLink?.url) ||
        val(s.externalLink) ||
        val(s.ctaLink) ||
        "";

      return { thumbnail, contentUrl, uploadDate, mediaType, ...(link ? { link } : {}) };
    })
    .filter((s) => s.contentUrl);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  if (!username) return error("Username required");

  try {
    const res = await fetch(`https://www.snapchat.com/@${username}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });

    const html = await res.text();
    let stories: SnapItem[] = [];
    let highlightGroups: HighlightGroup[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let profile: any = null;

    // Extract __NEXT_DATA__
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const pp = nextData?.props?.pageProps;
        if (pp) {
          // Profile
          const up = pp.userProfile?.publicProfileInfo || pp.userProfile || {};
          profile = {
            name: val(up.title) || val(up.displayName) || val(up.username) || username,
            image: val(up.profilePictureUrl) || null,
            description: val(up.bio) || "",
            url: `https://snapchat.com/@${username}`,
          };

          // Active stories
          if (pp.story?.snapList) {
            stories = parseSnaps(pp.story.snapList).slice(0, 20);
          }

          // Highlight GROUPS — keep them as groups with nested snaps
          if (Array.isArray(pp.curatedHighlights)) {
            highlightGroups = pp.curatedHighlights.map((h: any) => ({
              title: val(h.storyTitle) || val(h.emoji) || "Highlight",
              thumbnail: val(h.thumbnailUrl) || "",
              snaps: parseSnaps(h.snapList || []),
            })).filter((g: HighlightGroup) => g.snaps.length > 0);
          }
        }
      } catch { /* skip */ }
    }

    // JSON-LD fallback for highlights
    if (highlightGroups.length === 0) {
      const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
      if (jsonLdMatches) {
        for (const match of jsonLdMatches) {
          const jsonStr = match.replace(/<script[^>]*>/, "").replace(/<\/script>/, "");
          try {
            const data = JSON.parse(jsonStr);
            if (!profile && data["@type"] === "ProfilePage") {
              profile = {
                name: data.mainEntity?.name || username,
                image: data.mainEntity?.image || null,
                description: data.mainEntity?.description || "",
                url: `https://snapchat.com/@${username}`,
              };
            }
            if (data["@type"] === "ItemList" && data.itemListElement) {
              // Put all JSON-LD items as one highlight group
              const snaps: SnapItem[] = data.itemListElement
                .filter((item: any) => item["@type"] === "VideoObject" || item["@type"] === "ImageObject")
                .map((item: any) => ({
                  thumbnail: item.thumbnailUrl || "",
                  contentUrl: item.contentUrl || "",
                  uploadDate: item.uploadDate || "",
                  mediaType: item.encodingFormat?.includes("video") ? "video" as const : "image" as const,
                }))
                .filter((s: SnapItem) => s.contentUrl);
              if (snaps.length > 0) {
                highlightGroups.push({ title: "Highlights", thumbnail: snaps[0].thumbnail, snaps });
              }
            }
          } catch { /* skip */ }
        }
      }
    }

    return success({ stories, highlightGroups, profile });
  } catch {
    return error("Failed to fetch Snapchat data", 500);
  }
}
