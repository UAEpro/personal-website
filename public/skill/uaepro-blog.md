---
name: uaepro-blog
description: Manage blog posts on UAEpro.me — create drafts, write articles, publish, edit, and organize content with categories and tags. Use this skill whenever the user mentions writing a blog post, creating an article, publishing content on their website, managing blog drafts, or anything related to uaepro.me blog management. Also trigger when the user says things like "write something for my blog", "post this on my site", "check my drafts", or "publish that article".
---

# UAEpro.me Blog Manager

Manage blog posts on uaepro.me through its REST API. This skill lets you create draft posts, publish them, manage categories/tags, and list existing content — all from Claude Code.

## Setup

The skill needs two environment variables. Check if they're set before making any API call:

```bash
echo "URL: ${UAEPRO_API_URL:-NOT SET}" && echo "Key: ${UAEPRO_API_KEY:+set}"
```

If not set, tell the user:
> Set these in your shell profile or `.env`:
> ```
> export UAEPRO_API_URL=https://uaepro.me
> export UAEPRO_API_KEY=<your-api-key-from-admin-settings>
> ```

## API Reference

All endpoints use Bearer token auth. Every request needs:
```
Authorization: Bearer $UAEPRO_API_KEY
```

### Posts

| Action | Method | Endpoint | Body |
|--------|--------|----------|------|
| List | GET | `/api/posts?status=DRAFT&page=1&limit=10` | — |
| Get by ID | GET | `/api/posts/{id}` | — |
| Create | POST | `/api/posts` | `{title, content, excerpt, status, categoryId, tags}` |
| Update | PUT | `/api/posts/{id}` | partial fields |
| Delete | DELETE | `/api/posts/{id}` | — |

Status values: `DRAFT`, `PUBLISHED`, `ARCHIVED`
Query params: `?status=`, `?category=`, `?tag=`, `?search=`, `?page=`, `?limit=`

### Categories & Tags

| Action | Method | Endpoint | Body |
|--------|--------|----------|------|
| List categories | GET | `/api/categories` | — |
| Create category | POST | `/api/categories` | `{name}` |
| List tags | GET | `/api/tags` | — |
| Create tag | POST | `/api/tags` | `{name}` |

## Workflows

### Writing a new blog post

This is the most common task. When the user asks you to write a blog post:

1. **Write the content** in HTML. Use semantic tags: `<h2>`, `<h3>`, `<p>`, `<ul>`, `<ol>`, `<pre><code class="language-js">`, `<blockquote>`. The blog renders HTML directly in a WYSIWYG editor, so structure matters.

2. **Write in Arabic by default** — the blog is Arabic RTL. If the user asks for English or another language, follow their lead.

3. **Generate a title and excerpt**. The excerpt is 1-2 sentences shown in post cards on the homepage and blog listing.

4. **Check categories first** — list existing categories and pick one that fits, or create a new one if needed.

5. **Create the post as DRAFT**:

```bash
curl -s -X POST "$UAEPRO_API_URL/api/posts" \
  -H "Authorization: Bearer $UAEPRO_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(cat <<'POSTEOF'
{
  "title": "عنوان المقال هنا",
  "content": "<h2>مقدمة</h2><p>محتوى المقال...</p>",
  "excerpt": "ملخص قصير للمقال يظهر في صفحة المدونة",
  "status": "DRAFT",
  "categoryId": null,
  "tags": []
}
POSTEOF
)"
```

6. **Report back** with the post ID and title. Ask the user: "The draft is ready. Want me to publish it, or would you like to review it first in the admin panel?"

7. **Only publish when the user confirms**:

```bash
curl -s -X PUT "$UAEPRO_API_URL/api/posts/{id}" \
  -H "Authorization: Bearer $UAEPRO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "PUBLISHED"}'
```

### Listing and checking posts

```bash
# List recent drafts
curl -s "$UAEPRO_API_URL/api/posts?status=DRAFT&limit=10" \
  -H "Authorization: Bearer $UAEPRO_API_KEY"

# List published posts
curl -s "$UAEPRO_API_URL/api/posts?status=PUBLISHED&limit=10" \
  -H "Authorization: Bearer $UAEPRO_API_KEY"

# Search posts
curl -s "$UAEPRO_API_URL/api/posts?search=كلمة+البحث" \
  -H "Authorization: Bearer $UAEPRO_API_KEY"
```

Parse the JSON response and display posts in a readable format: ID, title, status, date.

### Editing an existing post

1. Fetch the post by ID to get current content
2. Make the requested changes
3. PUT the update with only the changed fields

```bash
curl -s -X PUT "$UAEPRO_API_URL/api/posts/{id}" \
  -H "Authorization: Bearer $UAEPRO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "العنوان المحدث", "content": "<p>المحتوى المحدث</p>"}'
```

## Content Guidelines

- **HTML format** — all content is HTML. No Markdown.
- **Arabic RTL** — default language. Use proper Arabic typography.
- **Semantic structure** — use `<h2>` for main sections, `<h3>` for subsections. Don't use `<h1>` (the post title is already h1).
- **Code blocks** — wrap in `<pre><code class="language-{lang}">`. The blog has syntax highlighting.
- **Images** — use `<img src="URL" alt="description">`. Images can be uploaded via the admin media manager.
- **Excerpts** — always include a meaningful 1-2 sentence summary. This appears on the homepage and blog listing cards.

## Response Format

The API returns:
```json
{"success": true, "data": {...}}
```

On error:
```json
{"success": false, "error": "message", "code": 400}
```

List endpoints include pagination:
```json
{"success": true, "data": [...], "pagination": {"page": 1, "limit": 20, "total": 42, "totalPages": 3}}
```
