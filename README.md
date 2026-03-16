# UAEpro.me — Personal Website

A full-stack Arabic RTL personal website with blog, admin panel, social media integration, and Claude Code skill for AI-assisted blogging.

Built with Next.js, TypeScript, Prisma, MySQL, and the Carbon Terminal dark theme.

## Features

- **Landing Page** — Hero with terminal animation, about section, latest posts, social feeds, projects, skills, links, contact form
- **Blog** — Full blog with categories, tags, search, pagination, comments (moderated), share buttons, syntax highlighting
- **Admin Panel** — Dashboard with stats, WYSIWYG post editor (Tiptap), media manager with drag-drop upload, comment moderation, project/skill/link management, settings
- **5 Themes** — Carbon Orange, Midnight Purple, Ocean Cyan, Ember Red, Forest Green — switchable from admin
- **Social Media Integration** — X/Twitter embedded timeline, Instagram profile card, Snapchat stories with in-site viewer, GitHub contribution chart — all toggleable and reorderable via drag-and-drop
- **Claude Code Skill** — Downloadable skill from admin panel to manage blog posts via Claude Code CLI
- **API** — Full REST API with Bearer token auth for external integrations
- **Responsive** — Mobile-first responsive design across all pages
- **RTL Arabic** — Full Arabic right-to-left layout with IBM Plex Sans Arabic typography
- **Docker** — Production-ready Dockerfile and docker-compose

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | MySQL + Prisma ORM |
| Auth | NextAuth.js v4 (Credentials) |
| Editor | Tiptap (RTL, paste-to-upload, code blocks) |
| Deployment | Docker on VPS + Apache/Nginx reverse proxy |

## Getting Started

### Prerequisites

- Node.js 20+
- MySQL 8+
- npm

### 1. Clone and Install

```bash
git clone https://github.com/UAEpro/personal-website.git
cd personal-website
npm install
```

### 2. Set Up Environment

Create a `.env.local` file:

```env
DATABASE_URL=mysql://YOUR_USER:YOUR_PASSWORD@localhost:3306/YOUR_DATABASE
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=your@email.com
```

Generate a secret:

```bash
openssl rand -base64 32
```

### 3. Set Up Database

```bash
npx prisma db push
```

### 4. Seed Admin User

```bash
npx prisma db seed
```

This creates a default admin user (`admin@uaepro.me` / `admin123`) and site settings. **Change the password after first login.**

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Make It Your Own

### Personalization Checklist

1. **Admin Panel** (`/admin`) — Log in and update:
   - **Settings > Theme** — Pick your theme and accent color
   - **Settings > Content** — Change the hero tagline and about section
   - **Settings > SEO** — Set your site title, description, and OG image
   - **Settings > Social** — Add your social media URLs, toggle platforms on/off, drag to reorder

2. **Site Name & Branding** — Search and replace these in the codebase:
   - `UAEpro` — Replace with your name/brand
   - `uaepro.me` — Replace with your domain
   - Update `src/components/public/navbar.tsx` logo text
   - Update `src/components/public/footer.tsx` copyright text

3. **Seed Script** — Edit `prisma/seed.ts`:
   - Change the default admin email
   - Change the default tagline and settings

4. **Favicon** — Replace `public/favicon.ico` with your own

5. **Domain** — Update `NEXTAUTH_URL` in your `.env` to your domain

### Adding Content

- **Blog Posts** — Admin > Posts > New Post (or use the Claude Code skill)
- **Projects** — Admin > Projects
- **Skills** — Admin > Skills
- **Links** — Admin > Links
- **Media** — Admin > Media (upload images for blog posts)

### Social Media Setup

| Platform | What to set in Admin > Settings > Social |
|----------|------------------------------------------|
| X/Twitter | Your X profile URL (e.g., `https://x.com/yourname`) |
| Instagram | Your Instagram URL (e.g., `https://instagram.com/yourname`) |
| Snapchat | Your Snapchat URL (e.g., `https://snapchat.com/@yourname`) |
| GitHub | Your GitHub URL (e.g., `https://github.com/yourname`) |

### Claude Code Skill

The admin panel has a **Skill** tab (Settings > Skill) that lets you download a Claude Code skill file. Install it to manage your blog from the terminal:

```bash
mkdir -p ~/.claude/skills/uaepro-blog
# Download SKILL.md from the admin panel's one-click install command
```

Then in Claude Code, just say: *"Write a blog post about..."*

## Production Deployment

### Docker (Recommended)

```bash
docker build -t my-website .
docker run -d \
  --name my-website \
  --network host \
  --env-file .env \
  -v ./uploads:/app/public/uploads \
  --restart unless-stopped \
  my-website
```

### With docker-compose

```bash
docker-compose up -d
```

### Database Setup

After deploying, push the schema and seed:

```bash
npx prisma db push
npx prisma db seed
```

### Apache Reverse Proxy

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public pages (landing, blog, links)
│   ├── admin/             # Admin panel pages
│   ├── api/               # REST API routes
│   └── login/             # Login page
├── components/
│   ├── admin/             # Admin UI components
│   ├── editor/            # Tiptap editor
│   ├── public/            # Public page components
│   └── shared/            # Shared components
├── lib/
│   ├── db.ts              # Prisma client
│   ├── auth.ts            # NextAuth config
│   ├── api-auth.ts        # API key auth
│   ├── api.ts             # Response helpers
│   ├── theme.ts           # Theme system
│   ├── rate-limit.ts      # Rate limiter
│   └── utils.ts           # Utilities
└── types/                 # TypeScript types

prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Seed script

public/
└── skill/                 # Claude Code skill file
```

## API Endpoints

All endpoints use `Authorization: Bearer <api-key>` for external access.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/posts` | List / create posts |
| GET/PUT/DELETE | `/api/posts/[id]` | Get / update / delete post |
| GET | `/api/posts/by-slug/[slug]` | Get post by slug (public) |
| GET/POST | `/api/categories` | List / create categories |
| GET/POST | `/api/tags` | List / create tags |
| GET/POST | `/api/media` | List / upload media |
| GET/POST | `/api/comments` | List / submit comments |
| GET/POST | `/api/links` | List / create links |
| GET/POST | `/api/projects` | List / create projects |
| GET/POST | `/api/skills` | List / create skills |
| GET/POST | `/api/contact` | List / submit contact messages |
| GET/PUT | `/api/settings` | Get / update site settings |
| GET | `/api/snapchat?username=x` | Fetch Snapchat stories |
| GET | `/api/skill` | Download Claude Code skill |

## License

MIT
