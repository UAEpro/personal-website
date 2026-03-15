"use client";

export default function BlogContentStyles() {
  return (
    <style jsx global>{`
      .blog-content h1,
      .blog-content h2,
      .blog-content h3,
      .blog-content h4 {
        color: var(--text-primary);
        margin-top: 2em;
        margin-bottom: 0.5em;
        font-weight: 600;
      }
      .blog-content h2 {
        font-size: 1.5em;
        border-bottom: 1px solid var(--border);
        padding-bottom: 0.3em;
      }
      .blog-content h3 {
        font-size: 1.25em;
      }
      .blog-content p {
        margin-bottom: 1.2em;
      }
      .blog-content a {
        color: var(--accent);
        text-decoration: underline;
      }
      .blog-content img {
        max-width: 100%;
        border-radius: 8px;
        margin: 1em 0;
      }
      .blog-content pre {
        background: var(--bg-terminal);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 16px;
        overflow-x: auto;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 14px;
        margin: 1.5em 0;
        direction: ltr;
        text-align: left;
      }
      .blog-content code {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 0.9em;
        background: var(--bg-terminal);
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid var(--border);
      }
      .blog-content pre code {
        background: none;
        border: none;
        padding: 0;
      }
      .blog-content blockquote {
        border-right: 3px solid var(--accent);
        padding-right: 16px;
        margin: 1.5em 0;
        color: var(--text-secondary);
        font-style: italic;
      }
      .blog-content ul,
      .blog-content ol {
        padding-right: 24px;
        margin-bottom: 1.2em;
      }
      .blog-content li {
        margin-bottom: 0.5em;
      }
      .blog-content hr {
        border: none;
        border-top: 1px solid var(--border);
        margin: 2em 0;
      }
      .blog-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5em 0;
      }
      .blog-content th,
      .blog-content td {
        border: 1px solid var(--border);
        padding: 8px 12px;
        text-align: right;
      }
      .blog-content th {
        background: var(--bg-secondary);
        font-weight: 600;
      }
    `}</style>
  );
}
