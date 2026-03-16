export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export function addHeadingIds(html: string): { html: string; headings: HeadingItem[] } {
  const headings: HeadingItem[] = [];
  let counter = 0;

  const processed = html.replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs, content) => {
      const text = content.replace(/<[^>]*>/g, "").trim();
      const id = `heading-${counter++}`;
      const level = parseInt(tag[1]);
      headings.push({ id, text, level });

      if (attrs.includes("id=")) return match;
      return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
    }
  );

  return { html: processed, headings };
}
