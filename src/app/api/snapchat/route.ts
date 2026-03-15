import { NextRequest } from "next/server";
import { success, error } from "@/lib/api";

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
    const jsonLdMatches = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    );
    if (!jsonLdMatches) return success({ stories: [], profile: null });

    let stories: any[] = [];
    let profile: any = null;

    for (const match of jsonLdMatches) {
      const jsonStr = match
        .replace(/<script type="application\/ld\+json">/, "")
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
          stories = data.itemListElement
            .filter(
              (item: any) =>
                item["@type"] === "VideoObject" ||
                item.item?.["@type"] === "VideoObject"
            )
            .map((item: any) => {
              const video =
                item["@type"] === "VideoObject" ? item : item.item;
              return {
                url: video.url || "",
                thumbnail: video.thumbnailUrl || "",
                contentUrl: video.contentUrl || "",
                uploadDate: video.uploadDate || "",
                description: video.description || "",
              };
            })
            .slice(0, 12); // Max 12 stories
        }
      } catch {
        // Skip invalid JSON
      }
    }

    return success({ stories, profile });
  } catch (e) {
    return error("Failed to fetch Snapchat data", 500);
  }
}
