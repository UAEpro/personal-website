---
name: uaepro-blog
description: Write and manage blog posts on UAEpro.me. Use when the user asks to write a blog post, create a draft, list posts, publish a post, or manage blog content on uaepro.me.
---

# UAEpro Blog Manager

You have access to the UAEpro.me blog API. Use it to create, edit, list, and publish blog posts.

## Configuration

Before using this skill, ensure these environment variables are set:
- `UAEPRO_API_URL` — The base URL of the website (e.g., `https://uaepro.me`)
- `UAEPRO_API_KEY` — The API key from the admin panel settings

## Available Actions

### Create a Draft Post

When the user asks you to write a blog post:

1. Write the content in HTML format (use proper heading tags, paragraphs, code blocks, lists)
2. Generate a meaningful title in Arabic (or the language the user specifies)
3. Write a short excerpt (1-2 sentences)
4. Call the API to create the post as a draft

```bash
curl -X POST "${UAEPRO_API_URL}/api/posts" \
  -H "Authorization: Bearer ${UAEPRO_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "عنوان المقال",
    "content": "<h2>...</h2><p>...</p>",
    "excerpt": "مقتطف قصير عن المقال",
    "status": "DRAFT",
    "categoryId": null,
    "tags": []
  }'
```

### List Posts

```bash
curl -X GET "${UAEPRO_API_URL}/api/posts?status=DRAFT&limit=10" \
  -H "Authorization: Bearer ${UAEPRO_API_KEY}"
```

Filter options: `?status=DRAFT`, `?status=PUBLISHED`, `?status=ARCHIVED`, `?search=keyword`

### Update a Post

```bash
curl -X PUT "${UAEPRO_API_URL}/api/posts/{id}" \
  -H "Authorization: Bearer ${UAEPRO_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "عنوان محدث",
    "content": "<p>محتوى محدث</p>",
    "status": "PUBLISHED"
  }'
```

### Publish a Draft

```bash
curl -X PUT "${UAEPRO_API_URL}/api/posts/{id}" \
  -H "Authorization: Bearer ${UAEPRO_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"status": "PUBLISHED"}'
```

### List Categories

```bash
curl -X GET "${UAEPRO_API_URL}/api/categories" \
  -H "Authorization: Bearer ${UAEPRO_API_KEY}"
```

### Create a Category

```bash
curl -X POST "${UAEPRO_API_URL}/api/categories" \
  -H "Authorization: Bearer ${UAEPRO_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"name": "اسم التصنيف"}'
```

### List Tags

```bash
curl -X GET "${UAEPRO_API_URL}/api/tags" \
  -H "Authorization: Bearer ${UAEPRO_API_KEY}"
```

### Create a Tag

```bash
curl -X POST "${UAEPRO_API_URL}/api/tags" \
  -H "Authorization: Bearer ${UAEPRO_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"name": "اسم الوسم"}'
```

## Writing Guidelines

When writing blog posts:
- Write content in HTML format (the blog uses a WYSIWYG editor, so HTML is rendered directly)
- Use proper semantic HTML: `<h2>`, `<h3>`, `<p>`, `<ul>`, `<ol>`, `<code>`, `<pre>`, `<blockquote>`
- For code blocks, use `<pre><code class="language-{lang}">...</code></pre>`
- The blog supports Arabic (RTL) — write in Arabic unless the user specifies another language
- Always create posts as DRAFT first, then ask the user if they want to publish
- Include a meaningful excerpt (1-2 sentences summarizing the post)

## Workflow

1. **User asks to write a post** → Write content, create as DRAFT, report the post ID
2. **User asks to list posts** → Fetch and display posts with ID, title, status, date
3. **User asks to publish** → Update status to PUBLISHED using the post ID
4. **User asks to edit** → Fetch the post, make changes, update via API
