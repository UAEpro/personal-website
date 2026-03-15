# UAEpro.me — Personal Website Design Spec

**Author:** Mayed Abdulla (UAEpro)
**Date:** 2026-03-16
**Status:** Draft

---

## 1. Overview

A personal website for Mayed Abdulla (UAEpro) — programmer, content creator, AI enthusiast, and gamer. The site serves as a personal brand hub with a blog, social media integration, portfolio, and a links/services directory. The entire public-facing site is in Arabic (RTL). An admin panel provides full control over content and appearance.

### Goals

- Establish a professional personal brand online
- Publish Arabic blog posts with a rich WYSIWYG editor
- Showcase social media presence (X, Instagram, Snapchat)
- Provide a links/services page for mini-apps and tools
- Enable AI-assisted blog writing via Claude Code skill + REST API
- Full admin control over content, theme, and features

---

## 2. Tech Stack

| Layer          | Technology                                      |
|----------------|------------------------------------------------|
| Framework      | Next.js 15 (App Router, Server Components)     |
| Language       | TypeScript                                      |
| Styling        | Tailwind CSS v4                                |
| Database       | MySQL + Prisma ORM                             |
| Auth           | NextAuth.js (credentials provider, single user)|
| Editor         | Tiptap (RTL, code blocks, images, embeds)      |
| Analytics      | Umami (self-hosted) or Plausible               |
| Deployment     | Docker on VPS (+ Nginx reverse proxy)          |
| Syntax Highlight | Shiki or Prism (for code in blog posts)      |

---

## 3. Project Structure

```
uaepro.me/
├── src/
│   ├── app/
│   │   ├── (public)/              # Public-facing pages (RTL, Arabic)
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx       # Blog listing (paginated, filterable)
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx   # Individual blog post
│   │   │   ├── links/
│   │   │   │   └── page.tsx       # Links/services page
│   │   │   └── layout.tsx         # Public layout (navbar, footer, RTL)
│   │   ├── admin/                 # Admin panel (RTL Arabic, same as public)
│   │   │   ├── page.tsx           # Dashboard with analytics
│   │   │   ├── posts/
│   │   │   │   ├── page.tsx       # Posts list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx   # New post editor
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Edit post editor
│   │   │   ├── media/
│   │   │   │   └── page.tsx       # Media manager
│   │   │   ├── comments/
│   │   │   │   └── page.tsx       # Comment moderation
│   │   │   ├── projects/
│   │   │   │   └── page.tsx       # Projects manager
│   │   │   ├── skills/
│   │   │   │   └── page.tsx       # Skills/tech stack manager
│   │   │   ├── messages/
│   │   │   │   └── page.tsx       # Contact messages
│   │   │   ├── links/
│   │   │   │   └── page.tsx       # Links/services manager
│   │   │   ├── settings/
│   │   │   │   └── page.tsx       # Theme, SEO, social toggles
│   │   │   └── layout.tsx         # Admin layout (sidebar nav)
│   │   ├── api/                   # REST API routes
│   │   │   ├── auth/[...nextauth]/
│   │   │   │   └── route.ts       # NextAuth handlers
│   │   │   ├── posts/
│   │   │   │   ├── route.ts       # GET (list), POST (create)
│   │   │   │   ├── by-slug/[slug]/
│   │   │   │   │   └── route.ts   # GET by slug (public)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # GET, PUT, DELETE
│   │   │   ├── media/
│   │   │   │   ├── route.ts       # GET (list), POST (upload)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # DELETE
│   │   │   ├── categories/
│   │   │   │   ├── route.ts       # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # PUT, DELETE
│   │   │   ├── tags/
│   │   │   │   ├── route.ts       # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # PUT, DELETE
│   │   │   ├── comments/
│   │   │   │   ├── route.ts       # GET, POST (public submit)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # PUT (approve/reject), DELETE
│   │   │   ├── links/
│   │   │   │   ├── route.ts       # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # PUT, DELETE
│   │   │   ├── projects/
│   │   │   │   ├── route.ts       # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # PUT, DELETE
│   │   │   ├── skills/
│   │   │   │   ├── route.ts       # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # PUT, DELETE
│   │   │   ├── contact/
│   │   │   │   ├── route.ts       # GET (admin), POST (public)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # PUT (mark read), DELETE
│   │   │   ├── settings/
│   │   │   │   └── route.ts       # GET, PUT
│   │   │   └── analytics/
│   │   │       └── route.ts       # GET (proxy to Umami)
│   │   └── login/
│   │       └── page.tsx           # Admin login page
│   ├── components/
│   │   ├── public/                # Landing page, blog components
│   │   ├── admin/                 # Admin UI components
│   │   ├── editor/                # Tiptap editor setup & extensions
│   │   └── shared/                # Shared UI (buttons, modals, inputs)
│   ├── lib/
│   │   ├── db.ts                  # Prisma client singleton
│   │   ├── auth.ts                # NextAuth config
│   │   ├── api-auth.ts            # API key validation for external clients
│   │   └── utils.ts               # Helpers (slug generation, reading time calc)
│   └── styles/
│       └── globals.css            # Tailwind config + CSS theme variables
├── prisma/
│   └── schema.prisma              # Database schema
├── public/
│   └── uploads/                   # Media file storage
├── docker-compose.yml             # Docker deployment config
├── Dockerfile
└── .env                           # Environment variables (not committed)
```

---

## 4. Database Schema

### User

| Column       | Type     | Notes                   |
|-------------|----------|-------------------------|
| id          | Int (PK) | Auto-increment          |
| email       | String   | Unique                  |
| passwordHash| String   | Bcrypt hashed           |
| name        | String   | Display name            |
| createdAt   | DateTime | Default: now()          |

### Post

| Column         | Type     | Notes                          |
|---------------|----------|--------------------------------|
| id            | Int (PK) | Auto-increment                 |
| authorId      | Int (FK) | → User (single user, for data integrity) |
| title         | String   |                                |
| slug          | String   | Unique, auto-generated         |
| content       | Text     | HTML output from Tiptap        |
| excerpt       | String   | Short summary                  |
| coverImage    | String?  | URL to media                   |
| status        | Enum     | DRAFT, PUBLISHED, ARCHIVED     |
| categoryId    | Int? (FK)| → Category                     |
| readingTime   | Int      | Auto-calculated (minutes)      |
| seoTitle      | String?  | Override for SEO               |
| seoDescription| String?  | Override for SEO               |
| ogImage       | String?  | Override OG image              |
| publishedAt   | DateTime?| When published                 |
| createdAt     | DateTime | Default: now()                 |
| updatedAt     | DateTime | Auto-updated                   |

### Category

| Column      | Type     | Notes          |
|------------|----------|----------------|
| id         | Int (PK) | Auto-increment |
| name       | String   |                |
| slug       | String   | Unique         |
| description| String?  |                |

### Tag

| Column | Type     | Notes          |
|--------|----------|----------------|
| id     | Int (PK) | Auto-increment |
| name   | String   |                |
| slug   | String   | Unique         |

### PostTag (join table)

| Column | Type    | Notes    |
|--------|---------|----------|
| postId | Int (FK)| → Post   |
| tagId  | Int (FK)| → Tag    |

### Media

| Column       | Type     | Notes                |
|-------------|----------|----------------------|
| id          | Int (PK) | Auto-increment       |
| filename    | String   | Stored filename      |
| originalName| String   | Original upload name |
| mimeType    | String   |                      |
| size        | Int      | Bytes                |
| url         | String   | Public URL path      |
| alt         | String?  | Accessibility text   |
| createdAt   | DateTime | Default: now()       |

### Comment

| Column      | Type     | Notes                        |
|------------|----------|------------------------------|
| id         | Int (PK) | Auto-increment               |
| postId     | Int (FK) | → Post                       |
| authorName | String   |                              |
| authorEmail| String   |                              |
| content    | Text     |                              |
| isApproved | Boolean  | Default: false (moderated)   |
| createdAt  | DateTime | Default: now()               |

### Link

| Column      | Type     | Notes                              |
|------------|----------|------------------------------------|
| id         | Int (PK) | Auto-increment                     |
| title      | String   |                                    |
| description| String?  |                                    |
| url        | String   | External or internal path          |
| icon       | String?  | Uploaded image URL or icon name    |
| category   | String   | service / mini-app / tool / other  |
| isActive   | Boolean  | Default: true                      |
| sortOrder  | Int      | For manual ordering                |
| createdAt  | DateTime | Default: now()                     |

### Project

| Column      | Type     | Notes                              |
|------------|----------|------------------------------------|
| id         | Int (PK) | Auto-increment                     |
| title      | String   |                                    |
| description| String?  |                                    |
| techStack  | String?  | Comma-separated tags (e.g., "Next.js, TypeScript") |
| url        | String?  | External link to project           |
| image      | String?  | Screenshot/thumbnail URL           |
| isActive   | Boolean  | Default: true                      |
| sortOrder  | Int      | For manual ordering                |
| createdAt  | DateTime | Default: now()                     |

### Skill (tech stack items)

| Column      | Type     | Notes                                    |
|------------|----------|------------------------------------------|
| id         | Int (PK) | Auto-increment                           |
| name       | String   | e.g., "TypeScript", "Python"             |
| icon       | String?  | Icon URL or icon library name            |
| category   | String   | language / framework / tool / other      |
| sortOrder  | Int      | For ordering within category             |

### ContactMessage

| Column      | Type     | Notes                        |
|------------|----------|------------------------------|
| id         | Int (PK) | Auto-increment               |
| name       | String   |                              |
| email      | String   |                              |
| message    | Text     |                              |
| isRead     | Boolean  | Default: false               |
| createdAt  | DateTime | Default: now()               |

### SiteSettings (single row)

| Column        | Type | Notes                                    |
|--------------|------|------------------------------------------|
| id           | Int  | Always 1                                 |
| theme        | JSON | `{ accent, preset, customCSS }`          |
| socialToggles| JSON | `{ x: bool, instagram: bool, snap: bool }`|
| socialLinks  | JSON | `{ xUrl, instagramUrl, snapchatUrl, instagramToken? }` |
| seoDefaults  | JSON | `{ title, description, ogImage }`        |
| aboutContent | Text | Rich text for about section              |
| heroTagline  | String|                                         |
| apiKeyHash  | String | Bcrypt-hashed API key (shown once on generation) |

---

## 5. Public Website

### 5.1 Landing Page

All sections are Arabic RTL. The Carbon Terminal design language applies throughout.

**Sections (top to bottom):**

1. **Navigation Bar** — Sticky top. Logo/name on the right (RTL), links: الرئيسية, المدونة, الروابط, تواصل. Mobile: hamburger menu. Dark background matching theme.

2. **Hero** — Full-width. Large "UAEpro" in Carbon Terminal style with animated cursor blink. Configurable tagline below. CTA button to blog. Dot-grid background pattern.

3. **About Me** — Profile image + bio text (editable from admin). Styled with code-comment aesthetic (`// عن مايد`).

4. **Latest Blog Posts** — 3 most recent published posts as cards. Each shows: cover image, title, category badge, reading time, date. "عرض الكل" link to /blog.

5. **Social Media Feed** — Conditionally rendered based on SiteSettings toggles:
   - **X (Twitter):** Embedded timeline widget via X embed API
   - **Instagram:** Recent posts via Instagram oEmbed API
   - **Snapchat:** Public stories via Snap web embed SDK
   - Each section has a heading and only renders if enabled

6. **Projects/Portfolio** — Grid of cards from the Project table: title, description, tech stack tags, screenshot, external link. Managed from `/admin/projects`.

7. **Skills/Tech Stack** — Icon grid from the Skill table, grouped by category (language, framework, tool). Managed from `/admin/skills`.

8. **Links/Services** — Grid of active links from the Link table. Icon, title, description, clickable.

9. **Contact** — Contact form (name, email, message) submitted to `POST /api/contact`. Includes honeypot spam protection. Messages viewable in admin at `/admin/messages`.

10. **Footer** — Copyright, social icons, "Built with Next.js" or similar.

### 5.2 Blog

**`/blog`** — Blog listing page:
- Search bar at top
- Category and tag filter chips
- Paginated post cards (cover, title, excerpt, category, date, reading time)

**`/blog/[slug]`** — Individual post:
- Cover image (full-width or contained)
- Title, date, category badge, reading time
- Tag pills
- Rendered HTML content with:
  - Proper Arabic typography
  - Code blocks with syntax highlighting (Shiki/Prism)
  - Responsive images
- Share buttons: X, WhatsApp, copy link
- Comments section:
  - Display approved comments
  - Submit form (name, email, comment)
  - Comments require admin approval before appearing

### 5.3 Links Page

**`/links`** — Standalone page showing all active links/services:
- Grid or list layout
- Filterable by category (service / mini-app / tool)
- Each item: icon, title, description, link button

---

## 6. Admin Panel

Dark theme matching the public site. RTL Arabic layout (same as public site). Protected by NextAuth session. The Tiptap editor supports both RTL (Arabic) and LTR (code blocks, English text) content via direction toggle.

### 6.1 Dashboard (`/admin`)

- **Stats cards:** Total posts, published count, draft count, total views
- **Views chart:** Line graph from Umami/Plausible API (last 30 days)
- **Recent posts:** Table of last 5 posts with status badges
- **Quick actions:** "New Post" button, "View Site" link

### 6.2 Posts (`/admin/posts`)

- **List view:** Table with columns — title, status (draft/published/archived badge), category, views, date, actions (edit/delete)
- **Filters:** Status dropdown, category dropdown, search input
- **Bulk actions:** Select multiple → delete or change status

**New/Edit Post (`/admin/posts/new`, `/admin/posts/[id]`):**
- **Main area:** Tiptap WYSIWYG editor
  - Toolbar: headings (H1-H4), bold, italic, underline, strikethrough, bullet list, ordered list, blockquote, code block, image insert (from media manager), link, embed, horizontal rule, undo/redo
  - RTL support with direction toggle
  - Full-screen mode
- **Side panel:**
  - Status selector (draft/published/archived)
  - Category dropdown (with "create new" option)
  - Tags multi-select (with "create new" option)
  - Cover image picker (opens media manager)
  - Excerpt text area
  - SEO section: title override, description override, OG image
  - Publish date picker
- **Auto-save:** Drafts auto-save every 30 seconds
- **Preview:** Button opens the post in a new tab as it would appear on the public site

### 6.3 Media Manager (`/admin/media`)

- **Grid view:** Thumbnails of all uploaded files
- **Upload:** Drag-and-drop zone + file picker button
- **Per-item actions:** Copy URL, edit alt text, delete
- **Storage:** Local filesystem at `public/uploads/`, organized by `YYYY/MM/` subdirectories
- **Supported types:** Images (jpg, png, gif, webp, svg), documents (pdf)

### 6.4 Comments (`/admin/comments`)

- **List view:** All comments with columns — post title, author, content preview, status (pending/approved), date
- **Actions per comment:** Approve, reject (delete), view full comment
- **Filter:** By status (pending/approved), by post

### 6.5 Projects (`/admin/projects`)

- **List view:** Drag-to-reorder list of projects
- **Per-item:** Title, description, tech stack tags, URL, screenshot image, active toggle
- **Actions:** Add new, edit, delete, reorder

### 6.6 Skills (`/admin/skills`)

- **Grouped view:** Skills organized by category (language, framework, tool)
- **Per-item:** Name, icon, category
- **Actions:** Add new, edit, delete, reorder within category

### 6.7 Messages (`/admin/messages`)

- **List view:** All contact form submissions — name, email, message preview, date, read/unread status
- **Actions:** Mark as read, delete

### 6.8 Links Manager (`/admin/links`)

- **List view:** Drag-to-reorder list of all links
- **Per-item:** Title, description, URL, icon, category dropdown, active toggle
- **Actions:** Add new, edit, delete, reorder

### 6.9 Settings (`/admin/settings`)

**Theme:**
- Preset selector: Original Orange, Emerald Hacker, Cyan Frost, Red Ember, Amber Warm, Syntax Theme
- Custom accent color picker (overrides preset)
- Live preview of changes

**Social Media:**
- Toggle switches: X (enabled/disabled), Instagram (enabled/disabled), Snapchat (enabled/disabled)
- URL/embed ID fields for each platform

**SEO Defaults:**
- Site title
- Site description
- Default OG image (pick from media manager)

**Content:**
- Hero tagline (text input)
- About section (rich text editor)

**API:**
- API key display (masked)
- Regenerate API key button
- Usage note: "Use this key with the Claude Code skill"

---

## 7. API Design

All routes under `/api/`. Authentication via NextAuth session (admin panel) or API key header (external clients like Claude Code skill).

### Authentication

- **Admin panel:** NextAuth session cookie (automatic)
- **External API:** `Authorization: Bearer <api-key>` header
- **API key:** Stored in SiteSettings, generated/regenerated from admin

### Endpoints

```
POST   /api/auth/[...nextauth]     # NextAuth login/logout/session

GET    /api/posts                   # List posts. Query: ?status, ?category, ?tag, ?search, ?page, ?limit
GET    /api/posts/by-slug/[slug]    # Get single post by slug (public)
GET    /api/posts/[id]              # Get single post by ID (admin)
POST   /api/posts                   # Create post. Body: { title, content, status, categoryId, tags[], ... }
PUT    /api/posts/[id]              # Update post
DELETE /api/posts/[id]              # Delete post

GET    /api/media                   # List all media files
POST   /api/media                   # Upload file (multipart/form-data). Max 10MB per file.
DELETE /api/media/[id]              # Delete media file (also removes from filesystem)

GET    /api/categories              # List categories
POST   /api/categories              # Create category. Body: { name, description? }
PUT    /api/categories/[id]         # Update category
DELETE /api/categories/[id]         # Delete category (unlinks posts, does not delete them)

GET    /api/tags                    # List tags
POST   /api/tags                    # Create tag. Body: { name }
PUT    /api/tags/[id]               # Update tag
DELETE /api/tags/[id]               # Delete tag (removes from PostTag join table)

GET    /api/comments                # Admin: all. Public: approved for a post (?postId)
POST   /api/comments                # Public submit. Body: { postId, authorName, authorEmail, content }
PUT    /api/comments/[id]           # Approve/reject. Body: { isApproved }
DELETE /api/comments/[id]           # Delete comment

GET    /api/links                   # Public: active only, ordered by sortOrder
POST   /api/links                   # Create link. Body: { title, description, url, icon, category }
PUT    /api/links/[id]              # Update link
DELETE /api/links/[id]              # Delete link

GET    /api/projects                # Public: active only, ordered by sortOrder
POST   /api/projects                # Create project (auth required)
PUT    /api/projects/[id]           # Update project (auth required)
DELETE /api/projects/[id]           # Delete project (auth required)

GET    /api/skills                  # Public: all skills grouped by category
POST   /api/skills                  # Create skill (auth required)
PUT    /api/skills/[id]             # Update skill (auth required)
DELETE /api/skills/[id]             # Delete skill (auth required)

POST   /api/contact                 # Public submit. Body: { name, email, message }
GET    /api/contact                 # List messages (auth required)
PUT    /api/contact/[id]            # Mark as read (auth required)
DELETE /api/contact/[id]            # Delete message (auth required)

GET    /api/settings                # Public: safe subset (theme, social). Auth: full settings
PUT    /api/settings                # Update settings. Body: partial SiteSettings JSON

GET    /api/analytics               # Proxy to Umami. Query: ?period (7d, 30d, 90d). Returns: pageviews, visitors, top pages.
```

### Spam Protection

Public endpoints (`POST /api/comments`, `POST /api/contact`) are protected by:
- **Honeypot field** — hidden form field; if filled, request is silently rejected
- **Rate limiting** — max 5 submissions per IP per 10 minutes (using in-memory store or Redis)

### Media Upload Constraints

- **Max file size:** 10MB per upload
- **Allowed types:** jpg, jpeg, png, gif, webp, svg, pdf
- **Filename sanitization:** Strip special characters, generate unique filename with UUID prefix
- **Storage path:** `public/uploads/YYYY/MM/<uuid>-<sanitized-name>`
- **Image optimization:** Resize images > 2000px wide using Sharp, generate WebP variant

### Pagination

All list endpoints support `?page=1&limit=20` (defaults). Response includes:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200  | Success (GET, PUT) |
| 201  | Created (POST) |
| 400  | Invalid request body / validation error |
| 401  | Not authenticated |
| 403  | Authenticated but not authorized |
| 404  | Resource not found |
| 413  | File too large (media upload) |
| 429  | Rate limited |
| 500  | Server error |

### Response Format

All API responses follow:
```json
{
  "success": true,
  "data": { ... }
}
```

Errors:
```json
{
  "success": false,
  "error": "Error message",
  "code": 400
}
```

---

## 8. Theme System

The Carbon Terminal design language is the foundation. Theme customization is stored in `SiteSettings.theme` as JSON.

### CSS Variables Approach

```css
:root {
  --bg-primary: #111113;
  --bg-secondary: #1a1a1e;
  --bg-terminal: #0d0d0f;
  --text-primary: #e4e4e7;
  --text-secondary: #888;
  --accent: #f97316;          /* Overridden by theme preset or custom color */
  --accent-hover: #ea580c;
  --border: #2a2a2e;
  --dot-grid: rgba(255,255,255,0.03);
}
```

### Presets

Each preset overrides `--accent` and related variables:
- **Original Orange:** `#f97316`
- **Emerald Hacker:** `#10b981`
- **Cyan Frost:** `#06b6d4`
- **Red Ember:** `#ef4444`
- **Amber Warm:** `#f59e0b`
- **Syntax Theme:** `#cba6f7` (multi-accent mode with additional variables)

Theme is loaded server-side from SiteSettings and injected as CSS variables into the root layout.

---

## 9. Claude Code Skill Integration

The website exposes a REST API authenticated via API key. A Claude Code skill (built separately after the website) will use this API.

### Skill Capabilities (planned)

- **Create draft post:** Title + content → saved as draft
- **List posts:** View existing posts and their status
- **Update post:** Edit content of existing posts
- **Publish post:** Change status from draft to published
- **Manage categories/tags:** Create and list

### API Key Flow

1. Admin generates API key in Settings
2. User stores API key in Claude Code's environment/config
3. Skill sends requests with `Authorization: Bearer <key>`
4. API validates key against SiteSettings.apiKey

---

## 10. Social Media Integration

### X (Twitter)

- Use X's official embed widget (`<blockquote class="twitter-tweet">` + script)
- Embed the user's timeline using X's timeline embed
- Toggle: on/off from admin settings
- Config: X profile URL in settings

### Instagram

- Use Instagram's oEmbed API to fetch embed HTML for recent posts
- **Requires:** Facebook App access token (long-lived token) — stored in `SiteSettings.socialLinks.instagramToken`
- Token is configured in admin settings and refreshed manually (long-lived tokens last 60 days, can be refreshed via API)
- Display as a carousel or grid on the landing page
- Toggle: on/off from admin settings
- Config: Instagram profile URL + access token in settings

### Snapchat

- **Primary approach:** Use Snap's official web embed SDK and social plugins to embed public stories from snapchat.com/@uaepro
- Snap provides embed code via the share/embed button on public profiles and stories
- The embed script (`snapkit.js`) renders stories in an iframe
- Toggle: on/off from admin settings
- Config: Snapchat username in settings
- **Fallback:** If the official embed doesn't surface stories automatically, use the embed code from individual stories (manually updated via admin or scraped via browser automation)

---

## 11. Deployment

### Docker Setup

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://user:pass@host:3306/db
      - NEXTAUTH_SECRET=...
      - NEXTAUTH_URL=https://uaepro.me
    volumes:
      - ./uploads:/app/public/uploads
    restart: unless-stopped
```

**Note:** The `uploads` volume maps host `./uploads` to container `/app/public/uploads`. In local dev (non-Docker), uploads go directly to `public/uploads/`. The Dockerfile uses Next.js `standalone` output mode and copies the `public` directory into the build. A custom `server.js` serves static files from the uploads directory.

### Nginx Reverse Proxy

- Proxy pass to localhost:3000
- SSL via Let's Encrypt (certbot)
- Domain: uaepro.me

### Environment Variables

```
DATABASE_URL=mysql://mayedweb:***@localhost:3306/mayedweb
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=https://uaepro.me
ADMIN_EMAIL=<your-email>
ADMIN_PASSWORD_HASH=<bcrypt-hash>
```

---

## 12. Search

Blog search (`?search` param) uses MySQL `LIKE` queries on title, excerpt, and content fields. This is sufficient for a personal blog's scale. If Arabic morphological search becomes needed later, consider adding MySQL full-text search with `ngram` parser.

---

## 13. Caching Strategy

- **Blog posts:** Use Next.js ISR (Incremental Static Regeneration) with `revalidate: 60` (1 minute). Published posts are statically generated and revalidated on demand.
- **Landing page:** ISR with `revalidate: 300` (5 minutes). Social embeds are client-side rendered.
- **Admin panel:** No caching — always server-rendered with fresh data.
- **API routes:** No caching — always fresh. Public GET endpoints may add `Cache-Control` headers for CDN caching later.

---

## 14. Auto-Save

When editing a post:
1. If the post is **new** (no ID yet): first auto-save triggers `POST /api/posts` with `status: DRAFT`, receives the new post ID, subsequent saves use `PUT /api/posts/[id]`.
2. If the post **already exists**: auto-save calls `PUT /api/posts/[id]` every 30 seconds when content has changed (dirty check).
3. A "Saving..." / "Saved" indicator shows in the editor UI.

---

## 15. Seed Script & Initial Setup

A `prisma/seed.ts` script runs on first deployment (`npx prisma db seed`):
1. Creates the admin User row using `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` from env vars
2. Creates the SiteSettings row (id=1) with default theme (Original Orange), empty social config, and a generated API key
3. Idempotent — safe to run multiple times

---

## 16. Comment Privacy

- `authorEmail` on comments is **never displayed publicly** — admin-only visibility
- Emails may be used for Gravatar avatar lookup (hash-based, no exposure)
- Comment submission includes a note: "Your email will not be displayed publicly"

---

## 17. Non-Goals (Out of Scope)

- Multi-user / multi-author support
- Newsletter / email subscription
- Internationalization (i18n) beyond Arabic — single language site
- E-commerce or payments
- Mobile app
- Real-time features (WebSocket, live chat)
