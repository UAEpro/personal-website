# UAEpro.me Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Arabic RTL personal website with blog, admin panel, social media integration, and API for Claude Code skill integration.

**Architecture:** Single Next.js 15 app (App Router) with Prisma ORM on MySQL. Public pages are Arabic RTL with Carbon Terminal dark theme. Admin panel shares the same app under `/admin`. REST API routes serve both the admin frontend and external clients (Claude Code skill). Theme is customizable via CSS variables loaded from database settings.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v3, Prisma, MySQL, NextAuth.js v4, Tiptap editor, Sharp (image processing), Shiki (syntax highlighting)

**Spec:** `docs/superpowers/specs/2026-03-16-uaepro-personal-website-design.md`

---

## Chunk 1: Foundation — Project Setup, Database, Auth

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `.env.local`
- Create: `.gitignore`

- [ ] **Step 1: Create Next.js app with TypeScript and Tailwind**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Answer prompts: Yes to all defaults.

- [ ] **Step 2: Install core dependencies**

```bash
npm install prisma @prisma/client next-auth@4 bcryptjs sharp uuid next-auth
npm install -D @types/bcryptjs @types/uuid
```

- [ ] **Step 3: Create `.env.local`**

```env
DATABASE_URL="mysql://mayedweb:YOUR_PASSWORD@localhost:3306/mayedweb"
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="mayed@uaepro.me"
ADMIN_PASSWORD_HASH="$2a$12$placeholder"
```

- [ ] **Step 4: Update `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
```

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```

Expected: Server starts at http://localhost:3000

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js 15 project with TypeScript and Tailwind"
```

---

### Task 2: Prisma Schema & Database

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider mysql
```

- [ ] **Step 2: Write the full Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String
  name         String
  createdAt    DateTime @default(now())
  posts        Post[]
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Post {
  id             Int        @id @default(autoincrement())
  authorId       Int
  author         User       @relation(fields: [authorId], references: [id])
  title          String
  slug           String     @unique
  content        String     @db.LongText
  excerpt        String     @db.Text
  coverImage     String?
  status         PostStatus @default(DRAFT)
  categoryId     Int?
  category       Category?  @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  readingTime    Int        @default(0)
  seoTitle       String?
  seoDescription String?    @db.Text
  ogImage        String?
  publishedAt    DateTime?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  tags           PostTag[]
  comments       Comment[]

  @@index([status])
  @@index([slug])
  @@index([categoryId])
}

model Category {
  id          Int     @id @default(autoincrement())
  name        String
  slug        String  @unique
  description String?
  posts       Post[]
}

model Tag {
  id    Int       @id @default(autoincrement())
  name  String
  slug  String    @unique
  posts PostTag[]
}

model PostTag {
  postId Int
  tagId  Int
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
}

model Media {
  id           Int      @id @default(autoincrement())
  filename     String
  originalName String
  mimeType     String
  size         Int
  url          String
  alt          String?
  createdAt    DateTime @default(now())
}

model Comment {
  id          Int      @id @default(autoincrement())
  postId      Int
  post        Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorName  String
  authorEmail String
  content     String   @db.Text
  isApproved  Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@index([postId])
  @@index([isApproved])
}

model Link {
  id          Int      @id @default(autoincrement())
  title       String
  description String?  @db.Text
  url         String
  icon        String?
  category    String   @default("other")
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
}

model Project {
  id          Int      @id @default(autoincrement())
  title       String
  description String?  @db.Text
  techStack   String?
  url         String?
  image       String?
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
}

model Skill {
  id        Int    @id @default(autoincrement())
  name      String
  icon      String?
  category  String @default("other")
  sortOrder Int    @default(0)
}

model ContactMessage {
  id        Int      @id @default(autoincrement())
  name      String
  email     String
  message   String   @db.Text
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model SiteSettings {
  id            Int    @id @default(1)
  theme         Json   @default("{\"preset\":\"orange\",\"accent\":\"#f97316\"}")
  socialToggles Json   @default("{\"x\":false,\"instagram\":false,\"snapchat\":false}")
  socialLinks   Json   @default("{\"xUrl\":\"\",\"instagramUrl\":\"\",\"snapchatUrl\":\"\",\"instagramToken\":\"\"}")
  seoDefaults   Json   @default("{\"title\":\"UAEpro\",\"description\":\"\",\"ogImage\":\"\"}")
  aboutContent  String @db.LongText @default("")
  heroTagline   String @default("مبرمج | صانع محتوى | قيمر")
  apiKeyHash    String @default("")
}
```

- [ ] **Step 3: Push schema to database**

```bash
npx prisma db push
```

Expected: Database tables created successfully.

- [ ] **Step 4: Generate Prisma client**

```bash
npx prisma generate
```

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add Prisma schema with all database models"
```

---

### Task 3: Prisma Client Singleton & Utilities

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create Prisma client singleton**

Create `src/lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 2: Create utility functions**

Create `src/lib/utils.ts`:

```ts
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .substring(0, 200);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/db.ts src/lib/utils.ts
git commit -m "feat: add Prisma client singleton and utility functions"
```

---

### Task 4: Authentication (NextAuth.js)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/lib/api-auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/app/login/page.tsx`

- [ ] **Step 1: Create NextAuth config**

Create `src/lib/auth.ts`:

```ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) return null;

        return { id: String(user.id), email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
```

- [ ] **Step 2: Create API key validation helper**

Create `src/lib/api-auth.ts`:

```ts
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "./auth";
import { prisma } from "./db";
import { NextRequest } from "next/server";

export async function requireAuth(req: NextRequest) {
  // Check session first (admin panel)
  const session = await getServerSession(authOptions);
  if (session?.user) return session.user;

  // Check API key (external clients)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const key = authHeader.slice(7);
    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    if (settings?.apiKeyHash) {
      const valid = await bcrypt.compare(key, settings.apiKeyHash);
      if (valid) return { id: "api", email: "api@uaepro.me", name: "API" };
    }
  }

  return null;
}
```

- [ ] **Step 3: Create NextAuth route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 4: Create login page**

Create `src/app/login/page.tsx`:

```tsx
"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg-primary, #111113)" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 rounded-lg"
        style={{ background: "var(--bg-secondary, #1a1a1e)", border: "1px solid var(--border, #2a2a2e)" }}
      >
        <h1
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: "var(--accent, #f97316)" }}
        >
          تسجيل الدخول
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <div className="mb-4">
          <label className="block text-sm mb-2" style={{ color: "var(--text-secondary, #888)" }}>
            البريد الإلكتروني
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full p-3 rounded-md outline-none"
            style={{
              background: "var(--bg-primary, #111113)",
              color: "var(--text-primary, #e4e4e7)",
              border: "1px solid var(--border, #2a2a2e)",
            }}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-2" style={{ color: "var(--text-secondary, #888)" }}>
            كلمة المرور
          </label>
          <input
            name="password"
            type="password"
            required
            className="w-full p-3 rounded-md outline-none"
            style={{
              background: "var(--bg-primary, #111113)",
              color: "var(--text-primary, #e4e4e7)",
              border: "1px solid var(--border, #2a2a2e)",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 rounded-md font-bold transition-opacity disabled:opacity-50"
          style={{
            background: "var(--accent, #f97316)",
            color: "var(--bg-primary, #111113)",
          }}
        >
          {loading ? "جاري التحميل..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Create SessionProvider wrapper for client components**

Create `src/components/shared/providers.tsx`:

```tsx
"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

Then wrap children in `src/app/layout.tsx` body:
```tsx
import Providers from "@/components/shared/providers";
// ... in the return:
<body className="antialiased"><Providers>{children}</Providers></body>
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth.ts src/lib/api-auth.ts src/app/api/auth/ src/app/login/ src/components/shared/providers.tsx
git commit -m "feat: add NextAuth.js v4 authentication with credentials provider and login page"
```

---

### Task 5: Seed Script

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add prisma.seed config)

- [ ] **Step 1: Create seed script**

Create `prisma/seed.ts`:

```ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!email || !passwordHash) {
    // If no env vars, create with defaults for dev
    const hash = await bcrypt.hash("admin123", 12);
    await prisma.user.upsert({
      where: { email: "admin@uaepro.me" },
      update: {},
      create: {
        email: "admin@uaepro.me",
        passwordHash: hash,
        name: "UAEpro",
      },
    });
    console.log("Created default admin user (admin@uaepro.me / admin123)");
  } else {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        name: "UAEpro",
      },
    });
    console.log(`Created admin user: ${email}`);
  }

  // Create default SiteSettings
  const apiKey = randomBytes(32).toString("hex");
  const apiKeyHash = await bcrypt.hash(apiKey, 12);

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      theme: { preset: "orange", accent: "#f97316" },
      socialToggles: { x: false, instagram: false, snapchat: false },
      socialLinks: { xUrl: "", instagramUrl: "", snapchatUrl: "", instagramToken: "" },
      seoDefaults: { title: "UAEpro", description: "مبرمج | صانع محتوى | قيمر", ogImage: "" },
      aboutContent: "",
      heroTagline: "مبرمج | صانع محتوى | قيمر",
      apiKeyHash,
    },
  });

  console.log(`SiteSettings created. API Key (save this!): ${apiKey}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Add seed config to `package.json`**

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

Also install tsx:
```bash
npm install -D tsx
```

- [ ] **Step 3: Run the seed**

```bash
npx prisma db seed
```

Expected: Admin user and SiteSettings created. API key printed.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add database seed script for admin user and default settings"
```

---

### Task 6: Global Styles & Theme System

**Files:**
- Create: `src/styles/globals.css` (replace default)
- Create: `src/lib/theme.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create theme utility**

Create `src/lib/theme.ts`:

```ts
export const themePresets: Record<string, { accent: string; accentHover: string }> = {
  orange: { accent: "#f97316", accentHover: "#ea580c" },
  emerald: { accent: "#10b981", accentHover: "#059669" },
  cyan: { accent: "#06b6d4", accentHover: "#0891b2" },
  red: { accent: "#ef4444", accentHover: "#dc2626" },
  amber: { accent: "#f59e0b", accentHover: "#d97706" },
  syntax: { accent: "#cba6f7", accentHover: "#b48def" },
};

export function getThemeCSS(theme: { preset?: string; accent?: string }): string {
  const preset = themePresets[theme.preset || "orange"] || themePresets.orange;
  const accent = theme.accent || preset.accent;
  const accentHover = preset.accentHover;

  return `
    :root {
      --bg-primary: #111113;
      --bg-secondary: #1a1a1e;
      --bg-terminal: #0d0d0f;
      --text-primary: #e4e4e7;
      --text-secondary: #888888;
      --accent: ${accent};
      --accent-hover: ${accentHover};
      --border: #2a2a2e;
      --dot-grid: rgba(255, 255, 255, 0.03);
    }
  `;
}
```

- [ ] **Step 2: Write global CSS**

Replace `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #111113;
  --bg-secondary: #1a1a1e;
  --bg-terminal: #0d0d0f;
  --text-primary: #e4e4e7;
  --text-secondary: #888888;
  --accent: #f97316;
  --accent-hover: #ea580c;
  --border: #2a2a2e;
  --dot-grid: rgba(255, 255, 255, 0.03);
}

* {
  box-sizing: border-box;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: system-ui, -apple-system, sans-serif;
}

/* Dot grid background */
.dot-grid {
  background-image: radial-gradient(var(--dot-grid) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Terminal window */
.terminal-window {
  background: var(--bg-terminal);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.terminal-header {
  background: var(--bg-secondary);
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.terminal-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

/* Arabic typography */
.arabic-content {
  font-family: "IBM Plex Sans Arabic", system-ui, sans-serif;
  line-height: 1.8;
}
```

- [ ] **Step 3: Update root layout with theme injection**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getThemeCSS } from "@/lib/theme";
import "./globals.css";

async function getSettings() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    return settings;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const seo = (settings?.seoDefaults as { title?: string; description?: string; ogImage?: string }) || {};

  return {
    title: seo.title || "UAEpro",
    description: seo.description || "مبرمج | صانع محتوى | قيمر",
    openGraph: {
      title: seo.title || "UAEpro",
      description: seo.description || "",
      images: seo.ogImage ? [seo.ogImage] : [],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const theme = (settings?.theme as { preset?: string; accent?: string }) || {};
  const themeCSS = getThemeCSS(theme);

  return (
    <html lang="ar" dir="rtl">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Verify the app renders with dark theme**

```bash
npm run dev
```

Visit http://localhost:3000 — should show a dark page with correct theme colors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/ src/lib/theme.ts src/app/globals.css src/app/layout.tsx
git commit -m "feat: add Carbon Terminal theme system with CSS variables and presets"
```

---

## Chunk 2: API Routes — CRUD for All Entities

### Task 7: API Response Helpers & Rate Limiting

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/lib/rate-limit.ts`

- [ ] **Step 1: Create API response helpers**

Create `src/lib/api.ts`:

```ts
import { NextResponse } from "next/server";

export function success(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created(data: unknown) {
  return success(data, 201);
}

export function error(message: string, code = 400) {
  return NextResponse.json({ success: false, error: message, code }, { status: code });
}

export function paginated(data: unknown[], total: number, page: number, limit: number) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export function parseSearchParams(url: string) {
  const { searchParams } = new URL(url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const search = searchParams.get("search") || undefined;
  return { page, limit, search, searchParams };
}
```

- [ ] **Step 2: Create rate limiter**

Create `src/lib/rate-limit.ts`:

```ts
const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, maxRequests = 5, windowMs = 600000): boolean {
  cleanup();
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

// Cleanup stale entries lazily during checks
function cleanup() {
  const now = Date.now();
  if (rateMap.size > 1000) {
    for (const [ip, entry] of rateMap) {
      if (now > entry.resetAt) rateMap.delete(ip);
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/api.ts src/lib/rate-limit.ts
git commit -m "feat: add API response helpers and in-memory rate limiter"
```

---

### Task 8: Posts API

**Files:**
- Create: `src/app/api/posts/route.ts`
- Create: `src/app/api/posts/[id]/route.ts`
- Create: `src/app/api/posts/by-slug/[slug]/route.ts`

- [ ] **Step 1: Create posts list & create route**

Create `src/app/api/posts/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error, paginated, parseSearchParams } from "@/lib/api";
import { slugify, calculateReadingTime } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { page, limit, search, searchParams } = parseSearchParams(req.url);
  const status = searchParams.get("status") || undefined;
  const category = searchParams.get("category") || undefined;
  const tag = searchParams.get("tag") || undefined;

  const user = await requireAuth(req);
  const isAdmin = !!user;

  const where: Record<string, unknown> = {};

  // Public: only published posts
  if (!isAdmin) {
    where.status = "PUBLISHED";
  } else if (status) {
    where.status = status;
  }

  if (category) {
    where.category = { slug: category };
  }

  if (tag) {
    where.tags = { some: { tag: { slug: tag } } };
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return paginated(posts, total, page, limit);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const body = await req.json();
  const { title, content, excerpt, coverImage, status, categoryId, tags, seoTitle, seoDescription, ogImage, publishedAt } = body;

  if (!title) return error("Title is required");

  let slug = slugify(title);
  // Ensure unique slug
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const readingTime = calculateReadingTime(content || "");

  const authorId = user.id === "api" ? 1 : parseInt(user.id);

  const post = await prisma.post.create({
    data: {
      authorId,
      title,
      slug,
      content: content || "",
      excerpt: excerpt || "",
      coverImage,
      status: status || "DRAFT",
      categoryId: categoryId || null,
      readingTime,
      seoTitle,
      seoDescription,
      ogImage,
      publishedAt: status === "PUBLISHED" ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
    },
  });

  // Handle tags
  if (tags && Array.isArray(tags) && tags.length > 0) {
    for (const tagId of tags) {
      await prisma.postTag.create({
        data: { postId: post.id, tagId: parseInt(tagId) },
      });
    }
  }

  const result = await prisma.post.findUnique({
    where: { id: post.id },
    include: { category: true, tags: { include: { tag: true } } },
  });

  return created(result);
}
```

- [ ] **Step 2: Create post by-ID route (GET, PUT, DELETE)**

Create `src/app/api/posts/[id]/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, error } from "@/lib/api";
import { slugify, calculateReadingTime } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
    include: { category: true, tags: { include: { tag: true } }, author: { select: { name: true } } },
  });

  if (!post) return error("Post not found", 404);
  return success(post);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.post.findUnique({ where: { id: parseInt(id) } });
  if (!existing) return error("Post not found", 404);

  // Update slug if title changed
  let slug = existing.slug;
  if (body.title && body.title !== existing.title) {
    slug = slugify(body.title);
    const slugExists = await prisma.post.findFirst({ where: { slug, id: { not: parseInt(id) } } });
    if (slugExists) slug = `${slug}-${Date.now()}`;
  }

  const readingTime = body.content ? calculateReadingTime(body.content) : existing.readingTime;

  const post = await prisma.post.update({
    where: { id: parseInt(id) },
    data: {
      title: body.title ?? existing.title,
      slug,
      content: body.content ?? existing.content,
      excerpt: body.excerpt ?? existing.excerpt,
      coverImage: body.coverImage,
      status: body.status ?? existing.status,
      categoryId: body.categoryId !== undefined ? body.categoryId : existing.categoryId,
      readingTime,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      ogImage: body.ogImage,
      publishedAt: body.status === "PUBLISHED" && !existing.publishedAt
        ? new Date()
        : existing.publishedAt,
    },
  });

  // Update tags if provided
  if (body.tags && Array.isArray(body.tags)) {
    await prisma.postTag.deleteMany({ where: { postId: parseInt(id) } });
    for (const tagId of body.tags) {
      await prisma.postTag.create({
        data: { postId: parseInt(id), tagId: parseInt(tagId) },
      });
    }
  }

  const result = await prisma.post.findUnique({
    where: { id: post.id },
    include: { category: true, tags: { include: { tag: true } } },
  });

  return success(result);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  await prisma.post.delete({ where: { id: parseInt(id) } });
  return success({ deleted: true });
}
```

- [ ] **Step 3: Create post by-slug route**

Create `src/app/api/posts/by-slug/[slug]/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      author: { select: { name: true } },
      comments: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post || post.status !== "PUBLISHED") return error("Post not found", 404);
  return success(post);
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/posts/
git commit -m "feat: add Posts API routes (list, create, get by ID/slug, update, delete)"
```

---

### Task 9: Categories & Tags API

**Files:**
- Create: `src/app/api/categories/route.ts`
- Create: `src/app/api/categories/[id]/route.ts`
- Create: `src/app/api/tags/route.ts`
- Create: `src/app/api/tags/[id]/route.ts`

- [ ] **Step 1: Create categories routes**

Create `src/app/api/categories/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error } from "@/lib/api";
import { slugify } from "@/lib/utils";

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
  return success(categories);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { name, description } = await req.json();
  if (!name) return error("Name is required");

  const slug = slugify(name);
  const category = await prisma.category.create({
    data: { name, slug, description },
  });
  return created(category);
}
```

Create `src/app/api/categories/[id]/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, error } from "@/lib/api";
import { slugify } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const { name, description } = await req.json();

  const category = await prisma.category.update({
    where: { id: parseInt(id) },
    data: {
      ...(name && { name, slug: slugify(name) }),
      ...(description !== undefined && { description }),
    },
  });
  return success(category);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  // Unlink posts from this category
  await prisma.post.updateMany({
    where: { categoryId: parseInt(id) },
    data: { categoryId: null },
  });
  await prisma.category.delete({ where: { id: parseInt(id) } });
  return success({ deleted: true });
}
```

- [ ] **Step 2: Create tags routes**

Create `src/app/api/tags/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error } from "@/lib/api";
import { slugify } from "@/lib/utils";

export async function GET() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
  return success(tags);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { name } = await req.json();
  if (!name) return error("Name is required");

  const slug = slugify(name);
  const tag = await prisma.tag.create({ data: { name, slug } });
  return created(tag);
}
```

Create `src/app/api/tags/[id]/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, error } from "@/lib/api";
import { slugify } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const { name } = await req.json();
  if (!name) return error("Name is required");

  const tag = await prisma.tag.update({
    where: { id: parseInt(id) },
    data: { name, slug: slugify(name) },
  });
  return success(tag);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  await prisma.tag.delete({ where: { id: parseInt(id) } });
  return success({ deleted: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/categories/ src/app/api/tags/
git commit -m "feat: add Categories and Tags API routes with full CRUD"
```

---

### Task 10: Media API

**Files:**
- Create: `src/app/api/media/route.ts`
- Create: `src/app/api/media/[id]/route.ts`

- [ ] **Step 1: Create media list & upload route**

Create `src/app/api/media/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error, paginated, parseSearchParams } from "@/lib/api";
import { sanitizeFilename } from "@/lib/utils";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuid } from "uuid";
import sharp from "sharp";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { page, limit } = parseSearchParams(req.url);

  const [files, total] = await Promise.all([
    prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.media.count(),
  ]);

  return paginated(files, total, page, limit);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return error("No file uploaded");

  if (!ALLOWED_TYPES.includes(file.type)) {
    return error("File type not allowed. Allowed: jpg, png, gif, webp, svg, pdf");
  }

  if (file.size > MAX_SIZE) {
    return error("File too large. Maximum 10MB.", 413);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const date = new Date();
  const dir = join(process.cwd(), "public", "uploads", String(date.getFullYear()), String(date.getMonth() + 1).padStart(2, "0"));

  await mkdir(dir, { recursive: true });

  const id = uuid();
  const safeName = sanitizeFilename(file.name);
  const filename = `${id}-${safeName}`;
  const filepath = join(dir, filename);

  // Optimize images (resize if > 2000px wide)
  if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    if (metadata.width && metadata.width > 2000) {
      await image.resize(2000).toFile(filepath);
    } else {
      await writeFile(filepath, buffer);
    }

    // Generate WebP variant
    const webpPath = filepath.replace(/\.[^.]+$/, ".webp");
    await sharp(buffer).resize(2000, undefined, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(webpPath);
  } else {
    await writeFile(filepath, buffer);
  }

  const url = `/uploads/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${filename}`;
  const alt = formData.get("alt") as string || "";

  const media = await prisma.media.create({
    data: {
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url,
      alt,
    },
  });

  return created(media);
}
```

- [ ] **Step 2: Create media delete route**

Create `src/app/api/media/[id]/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, error } from "@/lib/api";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id: parseInt(id) } });
  if (!media) return error("File not found", 404);

  // Delete file from filesystem
  try {
    const filepath = join(process.cwd(), "public", media.url);
    await unlink(filepath);
    // Try to delete WebP variant
    const webpPath = filepath.replace(/\.[^.]+$/, ".webp");
    await unlink(webpPath).catch(() => {});
  } catch {
    // File might already be deleted
  }

  await prisma.media.delete({ where: { id: parseInt(id) } });
  return success({ deleted: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/media/
git commit -m "feat: add Media API with upload, image optimization, and delete"
```

---

### Task 11: Comments, Contact, Links, Projects, Skills, Settings API

**Files:**
- Create: `src/app/api/comments/route.ts`, `src/app/api/comments/[id]/route.ts`
- Create: `src/app/api/contact/route.ts`, `src/app/api/contact/[id]/route.ts`
- Create: `src/app/api/links/route.ts`, `src/app/api/links/[id]/route.ts`
- Create: `src/app/api/projects/route.ts`, `src/app/api/projects/[id]/route.ts`
- Create: `src/app/api/skills/route.ts`, `src/app/api/skills/[id]/route.ts`
- Create: `src/app/api/settings/route.ts`

- [ ] **Step 1: Create comments API**

Create `src/app/api/comments/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error, paginated, parseSearchParams } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  const { page, limit, searchParams } = parseSearchParams(req.url);
  const postId = searchParams.get("postId");

  const where: Record<string, unknown> = {};
  if (!user) {
    where.isApproved = true;
    if (postId) where.postId = parseInt(postId);
    else return error("postId is required for public access");
  }
  if (postId && user) where.postId = parseInt(postId);

  const statusFilter = searchParams.get("status");
  if (user && statusFilter === "pending") where.isApproved = false;
  if (user && statusFilter === "approved") where.isApproved = true;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      include: { post: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.comment.count({ where }),
  ]);

  return paginated(comments, total, page, limit);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (!rateLimit(ip)) return error("Too many requests", 429);

  const body = await req.json();
  const { postId, authorName, authorEmail, content, _honeypot } = body;

  // Honeypot check
  if (_honeypot) return created({ id: 0 }); // Silently accept

  if (!postId || !authorName || !authorEmail || !content) {
    return error("All fields are required");
  }

  const comment = await prisma.comment.create({
    data: {
      postId: parseInt(postId),
      authorName,
      authorEmail,
      content,
    },
  });

  return created(comment);
}
```

Create `src/app/api/comments/[id]/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, error } from "@/lib/api";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const { isApproved } = await req.json();

  const comment = await prisma.comment.update({
    where: { id: parseInt(id) },
    data: { isApproved },
  });
  return success(comment);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  await prisma.comment.delete({ where: { id: parseInt(id) } });
  return success({ deleted: true });
}
```

- [ ] **Step 2: Create contact API**

Create `src/app/api/contact/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error, paginated, parseSearchParams } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { page, limit } = parseSearchParams(req.url);
  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contactMessage.count(),
  ]);
  return paginated(messages, total, page, limit);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (!rateLimit(ip)) return error("Too many requests", 429);

  const { name, email, message, _honeypot } = await req.json();
  if (_honeypot) return created({ id: 0 });

  if (!name || !email || !message) return error("All fields are required");

  const msg = await prisma.contactMessage.create({
    data: { name, email, message },
  });
  return created(msg);
}
```

Create `src/app/api/contact/[id]/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, error } from "@/lib/api";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const { isRead } = await req.json();
  const msg = await prisma.contactMessage.update({
    where: { id: parseInt(id) },
    data: { isRead },
  });
  return success(msg);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  await prisma.contactMessage.delete({ where: { id: parseInt(id) } });
  return success({ deleted: true });
}
```

- [ ] **Step 3: Create links API**

Create `src/app/api/links/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error } from "@/lib/api";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  const where = user ? {} : { isActive: true };
  const links = await prisma.link.findMany({
    where,
    orderBy: { sortOrder: "asc" },
  });
  return success(links);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const body = await req.json();
  if (!body.title || !body.url) return error("Title and URL are required");

  const maxOrder = await prisma.link.aggregate({ _max: { sortOrder: true } });
  const link = await prisma.link.create({
    data: {
      title: body.title,
      description: body.description,
      url: body.url,
      icon: body.icon,
      category: body.category || "other",
      sortOrder: (maxOrder._max.sortOrder || 0) + 1,
    },
  });
  return created(link);
}
```

Create `src/app/api/links/[id]/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, error } from "@/lib/api";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const body = await req.json();
  const link = await prisma.link.update({
    where: { id: parseInt(id) },
    data: body,
  });
  return success(link);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  await prisma.link.delete({ where: { id: parseInt(id) } });
  return success({ deleted: true });
}
```

- [ ] **Step 4: Create projects API**

Create `src/app/api/projects/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error } from "@/lib/api";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  const where = user ? {} : { isActive: true };
  const projects = await prisma.project.findMany({
    where,
    orderBy: { sortOrder: "asc" },
  });
  return success(projects);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const body = await req.json();
  if (!body.title) return error("Title is required");

  const maxOrder = await prisma.project.aggregate({ _max: { sortOrder: true } });
  const project = await prisma.project.create({
    data: {
      title: body.title,
      description: body.description,
      techStack: body.techStack,
      url: body.url,
      image: body.image,
      sortOrder: (maxOrder._max.sortOrder || 0) + 1,
    },
  });
  return created(project);
}
```

Create `src/app/api/projects/[id]/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, error } from "@/lib/api";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const body = await req.json();
  const project = await prisma.project.update({
    where: { id: parseInt(id) },
    data: body,
  });
  return success(project);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  await prisma.project.delete({ where: { id: parseInt(id) } });
  return success({ deleted: true });
}
```

- [ ] **Step 5: Create skills API**

Create `src/app/api/skills/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error } from "@/lib/api";

export async function GET() {
  const skills = await prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
  // Group by category
  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);
  return success(grouped);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const body = await req.json();
  if (!body.name) return error("Name is required");

  const maxOrder = await prisma.skill.aggregate({
    _max: { sortOrder: true },
    where: { category: body.category || "other" },
  });
  const skill = await prisma.skill.create({
    data: {
      name: body.name,
      icon: body.icon,
      category: body.category || "other",
      sortOrder: (maxOrder._max.sortOrder || 0) + 1,
    },
  });
  return created(skill);
}
```

Create `src/app/api/skills/[id]/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, error } from "@/lib/api";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const body = await req.json();
  const skill = await prisma.skill.update({
    where: { id: parseInt(id) },
    data: body,
  });
  return success(skill);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  await prisma.skill.delete({ where: { id: parseInt(id) } });
  return success({ deleted: true });
}
```

- [ ] **Step 6: Create settings API**

Create `src/app/api/settings/route.ts`:

```ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, error } from "@/lib/api";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  if (!settings) return error("Settings not found", 404);

  // Public: return safe subset only
  if (!user) {
    return success({
      theme: settings.theme,
      socialToggles: settings.socialToggles,
      socialLinks: (() => {
        const links = settings.socialLinks as Record<string, string>;
        // Strip tokens from public response
        const { instagramToken, ...safe } = links;
        return safe;
      })(),
      seoDefaults: settings.seoDefaults,
      heroTagline: settings.heroTagline,
      aboutContent: settings.aboutContent,
    });
  }

  // Admin: return everything except raw apiKeyHash
  return success({
    ...settings,
    apiKeyHash: settings.apiKeyHash ? "••••••••" : "",
  });
}

export async function PUT(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const body = await req.json();

  // Handle API key regeneration
  if (body.regenerateApiKey) {
    const newKey = randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(newKey, 12);
    await prisma.siteSettings.update({
      where: { id: 1 },
      data: { apiKeyHash: hash },
    });
    return success({ apiKey: newKey, message: "Save this key — it won't be shown again." });
  }

  // Remove fields that shouldn't be directly updated
  delete body.id;
  delete body.apiKeyHash;
  delete body.regenerateApiKey;

  const settings = await prisma.siteSettings.update({
    where: { id: 1 },
    data: body,
  });

  return success(settings);
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/api/comments/ src/app/api/contact/ src/app/api/links/ src/app/api/projects/ src/app/api/skills/ src/app/api/settings/
git commit -m "feat: add API routes for comments, contact, links, projects, skills, and settings"
```

---

## Chunk 3: Admin Panel — Layout & Core Pages

### Task 12: Admin Layout with Sidebar

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/components/admin/sidebar.tsx`

- [ ] **Step 1: Create admin sidebar component**

Create `src/components/admin/sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: "📊" },
  { href: "/admin/posts", label: "المقالات", icon: "📝" },
  { href: "/admin/media", label: "الوسائط", icon: "🖼️" },
  { href: "/admin/comments", label: "التعليقات", icon: "💬" },
  { href: "/admin/projects", label: "المشاريع", icon: "🚀" },
  { href: "/admin/skills", label: "المهارات", icon: "⚡" },
  { href: "/admin/messages", label: "الرسائل", icon: "📩" },
  { href: "/admin/links", label: "الروابط", icon: "🔗" },
  { href: "/admin/settings", label: "الإعدادات", icon: "⚙️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 min-h-screen p-4 flex flex-col"
      style={{ background: "var(--bg-secondary)", borderLeft: "1px solid var(--border)" }}
    >
      <Link
        href="/admin"
        className="text-xl font-bold mb-8 block"
        style={{ color: "var(--accent)" }}
      >
        UAEpro Admin
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{
                background: isActive ? "var(--bg-primary)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                border: isActive ? "1px solid var(--border)" : "1px solid transparent",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        target="_blank"
        className="text-sm mt-4 px-3 py-2"
        style={{ color: "var(--text-secondary)" }}
      >
        ← عرض الموقع
      </Link>
    </aside>
  );
}
```

- [ ] **Step 2: Create admin layout**

Create `src/app/admin/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div dir="rtl" className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8" style={{ background: "var(--bg-primary)" }}>
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Create admin dashboard page (placeholder)**

Create `src/app/admin/page.tsx`:

```tsx
import { prisma } from "@/lib/db";

export default async function AdminDashboard() {
  const [totalPosts, published, drafts] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
  ]);

  const recentPosts = await prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  const pendingComments = await prisma.comment.count({ where: { isApproved: false } });
  const unreadMessages = await prisma.contactMessage.count({ where: { isRead: false } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
        لوحة التحكم
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "إجمالي المقالات", value: totalPosts },
          { label: "منشورة", value: published },
          { label: "مسودات", value: drafts },
          { label: "تعليقات معلقة", value: pendingComments },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-lg"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            <div className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>{stat.label}</div>
            <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Unread messages banner */}
      {unreadMessages > 0 && (
        <div className="p-3 rounded-lg mb-6" style={{ background: "rgba(249,115,22,0.1)", border: "1px solid var(--accent)" }}>
          <span style={{ color: "var(--accent)" }}>لديك {unreadMessages} رسائل جديدة</span>
        </div>
      )}

      {/* Recent Posts */}
      <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>آخر المقالات</h2>
      <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg-secondary)" }}>
              <th className="text-right p-3" style={{ color: "var(--text-secondary)" }}>العنوان</th>
              <th className="text-right p-3" style={{ color: "var(--text-secondary)" }}>الحالة</th>
              <th className="text-right p-3" style={{ color: "var(--text-secondary)" }}>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {recentPosts.map((post) => (
              <tr key={post.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>{post.title}</td>
                <td className="p-3">
                  <span
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      background: post.status === "PUBLISHED" ? "rgba(16,185,129,0.2)" : "rgba(249,115,22,0.2)",
                      color: post.status === "PUBLISHED" ? "#10b981" : "#f97316",
                    }}
                  >
                    {post.status === "PUBLISHED" ? "منشور" : post.status === "DRAFT" ? "مسودة" : "مؤرشف"}
                  </span>
                </td>
                <td className="p-3" style={{ color: "var(--text-secondary)" }}>
                  {new Date(post.createdAt).toLocaleDateString("ar")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/ src/components/admin/
git commit -m "feat: add admin layout with sidebar navigation and dashboard page"
```

---

### Task 13: Admin Posts List & Editor Pages

This is a large task — it creates the posts management UI and integrates the Tiptap editor.

**Files:**
- Create: `src/app/admin/posts/page.tsx`
- Create: `src/app/admin/posts/new/page.tsx`
- Create: `src/app/admin/posts/[id]/page.tsx`
- Create: `src/components/editor/tiptap-editor.tsx`
- Create: `src/components/admin/post-form.tsx`

- [ ] **Step 1: Install Tiptap dependencies**

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-code-block-lowlight @tiptap/extension-placeholder @tiptap/extension-horizontal-rule @tiptap/pm lowlight
```

- [ ] **Step 2: Create Tiptap editor component**

Create `src/components/editor/tiptap-editor.tsx`:

```tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

function ToolbarButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 py-1 rounded text-xs transition-colors"
      style={{
        background: active ? "var(--accent)" : "var(--bg-primary)",
        color: active ? "var(--bg-primary)" : "var(--text-secondary)",
        border: "1px solid var(--border)",
      }}
    >
      {children}
    </button>
  );
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Image.configure({ HTMLAttributes: { class: "rounded-lg max-w-full" } }),
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "ابدأ الكتابة هنا..." }),
      CodeBlockLowlight.configure({ lowlight }),
      HorizontalRule,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none p-4 min-h-[400px] outline-none arabic-content",
        dir: "rtl",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      {/* Toolbar */}
      <div
        className="flex flex-wrap gap-1 p-2"
        style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}
      >
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>H1</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>H3</ToolbarButton>
        <span className="w-px mx-1" style={{ background: "var(--border)" }} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>B</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>I</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>U</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>S</ToolbarButton>
        <span className="w-px mx-1" style={{ background: "var(--border)" }} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>•</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>1.</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>&ldquo;</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}>{"</>"}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</ToolbarButton>
        <span className="w-px mx-1" style={{ background: "var(--border)" }} />
        <ToolbarButton
          onClick={() => {
            const url = window.prompt("رابط الصورة:");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
        >
          IMG
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const url = window.prompt("الرابط:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
            else editor.chain().focus().unsetLink().run();
          }}
          active={editor.isActive("link")}
        >
          🔗
        </ToolbarButton>
        <span className="w-px mx-1" style={{ background: "var(--border)" }} />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>→</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>↔</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>←</ToolbarButton>
        <span className="w-px mx-1" style={{ background: "var(--border)" }} />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>↩</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>↪</ToolbarButton>
      </div>

      {/* Editor */}
      <div style={{ background: "var(--bg-terminal)" }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create post form component**

Create `src/components/admin/post-form.tsx`:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/components/editor/tiptap-editor";

interface PostFormProps {
  post?: {
    id: number;
    title: string;
    content: string;
    excerpt: string;
    coverImage: string | null;
    status: string;
    categoryId: number | null;
    tags: { tag: { id: number; name: string } }[];
    seoTitle: string | null;
    seoDescription: string | null;
    ogImage: string | null;
  };
  categories: { id: number; name: string }[];
  tags: { id: number; name: string }[];
}

export default function PostForm({ post, categories, tags }: PostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [postId, setPostId] = useState(post?.id || null);

  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [status, setStatus] = useState(post?.status || "DRAFT");
  const [categoryId, setCategoryId] = useState(post?.categoryId || "");
  const [selectedTags, setSelectedTags] = useState<number[]>(
    post?.tags?.map((t) => t.tag.id) || []
  );
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription || "");

  const save = useCallback(async (auto = false) => {
    if (!title && auto) return;
    setSaving(true);
    setSaveStatus("جاري الحفظ...");

    const body = {
      title, content, excerpt, coverImage: coverImage || null,
      status, categoryId: categoryId ? parseInt(String(categoryId)) : null,
      tags: selectedTags, seoTitle: seoTitle || null, seoDescription: seoDescription || null,
    };

    try {
      if (postId) {
        await fetch(`/api/posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success && data.data?.id) {
          setPostId(data.data.id);
          if (!auto) router.replace(`/admin/posts/${data.data.id}`);
        }
      }
      setSaveStatus("تم الحفظ ✓");
    } catch {
      setSaveStatus("خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  }, [title, content, excerpt, coverImage, status, categoryId, selectedTags, seoTitle, seoDescription, postId, router]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => save(true), 30000);
    return () => clearInterval(interval);
  }, [save]);

  return (
    <div className="flex gap-6">
      {/* Main Editor */}
      <div className="flex-1">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان المقال"
          className="w-full text-2xl font-bold mb-4 p-3 rounded-lg outline-none"
          style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
        />
        <TiptapEditor content={content} onChange={setContent} />
      </div>

      {/* Side Panel */}
      <div className="w-72 flex flex-col gap-4">
        {/* Save Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{saveStatus}</span>
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="px-4 py-2 rounded-lg font-bold text-sm"
            style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
          >
            {saving ? "..." : "حفظ"}
          </button>
        </div>

        {/* Status */}
        <div className="p-4 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>الحالة</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 rounded text-sm"
            style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
          >
            <option value="DRAFT">مسودة</option>
            <option value="PUBLISHED">منشور</option>
            <option value="ARCHIVED">مؤرشف</option>
          </select>
        </div>

        {/* Category */}
        <div className="p-4 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>التصنيف</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-2 rounded text-sm"
            style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
          >
            <option value="">بدون تصنيف</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="p-4 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>الوسوم</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  setSelectedTags((prev) =>
                    prev.includes(t.id) ? prev.filter((id) => id !== t.id) : [...prev, t.id]
                  )
                }
                className="px-2 py-1 rounded text-xs"
                style={{
                  background: selectedTags.includes(t.id) ? "var(--accent)" : "var(--bg-primary)",
                  color: selectedTags.includes(t.id) ? "var(--bg-primary)" : "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Excerpt */}
        <div className="p-4 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>المقتطف</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full p-2 rounded text-sm outline-none resize-none"
            style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
          />
        </div>

        {/* Cover Image */}
        <div className="p-4 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>صورة الغلاف</label>
          <input
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="رابط الصورة"
            className="w-full p-2 rounded text-sm outline-none"
            style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
          />
        </div>

        {/* SEO */}
        <div className="p-4 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>SEO</label>
          <input
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="عنوان SEO"
            className="w-full p-2 rounded text-sm mb-2 outline-none"
            style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
          />
          <textarea
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="وصف SEO"
            rows={2}
            className="w-full p-2 rounded text-sm outline-none resize-none"
            style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create posts list page**

Create `src/app/admin/posts/page.tsx`:

```tsx
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const statusLabels: Record<string, { label: string; color: string }> = {
    PUBLISHED: { label: "منشور", color: "#10b981" },
    DRAFT: { label: "مسودة", color: "#f97316" },
    ARCHIVED: { label: "مؤرشف", color: "#888" },
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>المقالات</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 rounded-lg font-bold text-sm"
          style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
        >
          + مقال جديد
        </Link>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg-secondary)" }}>
              <th className="text-right p-3" style={{ color: "var(--text-secondary)" }}>العنوان</th>
              <th className="text-right p-3" style={{ color: "var(--text-secondary)" }}>الحالة</th>
              <th className="text-right p-3" style={{ color: "var(--text-secondary)" }}>التصنيف</th>
              <th className="text-right p-3" style={{ color: "var(--text-secondary)" }}>التاريخ</th>
              <th className="text-right p-3" style={{ color: "var(--text-secondary)" }}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td className="p-3" style={{ color: "var(--text-primary)" }}>{post.title}</td>
                <td className="p-3">
                  <span
                    className="px-2 py-1 rounded text-xs"
                    style={{ background: `${statusLabels[post.status].color}20`, color: statusLabels[post.status].color }}
                  >
                    {statusLabels[post.status].label}
                  </span>
                </td>
                <td className="p-3" style={{ color: "var(--text-secondary)" }}>{post.category?.name || "—"}</td>
                <td className="p-3" style={{ color: "var(--text-secondary)" }}>
                  {new Date(post.createdAt).toLocaleDateString("ar")}
                </td>
                <td className="p-3">
                  <Link href={`/admin/posts/${post.id}`} style={{ color: "var(--accent)" }}>تعديل</Link>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center" style={{ color: "var(--text-secondary)" }}>
                  لا توجد مقالات بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create new post page**

Create `src/app/admin/posts/new/page.tsx`:

```tsx
import { prisma } from "@/lib/db";
import PostForm from "@/components/admin/post-form";

export default async function NewPostPage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>مقال جديد</h1>
      <PostForm categories={categories} tags={tags} />
    </div>
  );
}
```

- [ ] **Step 6: Create edit post page**

Create `src/app/admin/posts/[id]/page.tsx`:

```tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PostForm from "@/components/admin/post-form";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
    include: { tags: { include: { tag: true } } },
  });

  if (!post) notFound();

  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>تعديل المقال</h1>
      <PostForm post={post} categories={categories} tags={tags} />
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/admin/posts/ src/components/editor/ src/components/admin/post-form.tsx
git commit -m "feat: add posts management pages with Tiptap WYSIWYG editor and auto-save"
```

---

### Task 14: Admin Media Manager Page

**Files:**
- Create: `src/app/admin/media/page.tsx`
- Create: `src/components/admin/media-grid.tsx`

- [ ] **Step 1: Create media grid client component**

Create `src/components/admin/media-grid.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  url: string;
  alt: string | null;
  size: number;
  createdAt: string;
}

export default function MediaGrid({ initialMedia }: { initialMedia: MediaItem[] }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const upload = useCallback(async (files: FileList) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      await fetch("/api/media", { method: "POST", body: form });
    }
    setUploading(false);
    router.refresh();
  }, [router]);

  const deleteMedia = async (id: number) => {
    if (!confirm("حذف هذا الملف؟")) return;
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
  };

  return (
    <div>
      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
        className="p-8 mb-6 rounded-lg text-center cursor-pointer transition-colors"
        style={{
          border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
          background: dragOver ? "rgba(249,115,22,0.05)" : "var(--bg-secondary)",
        }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.accept = "image/*,.pdf";
          input.onchange = () => input.files && upload(input.files);
          input.click();
        }}
      >
        <p style={{ color: "var(--text-secondary)" }}>
          {uploading ? "جاري الرفع..." : "اسحب الملفات هنا أو انقر للاختيار"}
        </p>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {initialMedia.map((item) => (
          <div
            key={item.id}
            className="rounded-lg overflow-hidden group relative"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            <div className="aspect-square relative">
              {item.mimeType.startsWith("image/") ? (
                <Image src={item.url} alt={item.alt || ""} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
                  PDF
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{item.originalName}</p>
              <div className="flex gap-2 mt-1">
                <button onClick={() => copyUrl(item.url)} className="text-xs" style={{ color: "var(--accent)" }}>نسخ</button>
                <button onClick={() => deleteMedia(item.id)} className="text-xs text-red-500">حذف</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create media page**

Create `src/app/admin/media/page.tsx`:

```tsx
import { prisma } from "@/lib/db";
import MediaGrid from "@/components/admin/media-grid";

export default async function AdminMediaPage() {
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>الوسائط</h1>
      <MediaGrid initialMedia={JSON.parse(JSON.stringify(media))} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/media/ src/components/admin/media-grid.tsx
git commit -m "feat: add admin media manager with drag-drop upload"
```

---

### Task 15: Admin Settings Page

**Files:**
- Create: `src/app/admin/settings/page.tsx`
- Create: `src/components/admin/settings-form.tsx`

- [ ] **Step 1: Create settings form client component**

Create `src/components/admin/settings-form.tsx`:

```tsx
"use client";

import { useState } from "react";

interface SettingsProps {
  settings: {
    theme: { preset?: string; accent?: string };
    socialToggles: { x: boolean; instagram: boolean; snapchat: boolean };
    socialLinks: { xUrl: string; instagramUrl: string; snapchatUrl: string; instagramToken: string };
    seoDefaults: { title: string; description: string; ogImage: string };
    heroTagline: string;
    aboutContent: string;
    apiKeyHash: string;
  };
}

const presets = [
  { id: "orange", label: "برتقالي", color: "#f97316" },
  { id: "emerald", label: "زمردي", color: "#10b981" },
  { id: "cyan", label: "سماوي", color: "#06b6d4" },
  { id: "red", label: "أحمر", color: "#ef4444" },
  { id: "amber", label: "عنبري", color: "#f59e0b" },
  { id: "syntax", label: "بنفسجي", color: "#cba6f7" },
];

export default function SettingsForm({ settings }: SettingsProps) {
  const [tab, setTab] = useState("theme");
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState(settings.theme);
  const [socialToggles, setSocialToggles] = useState(settings.socialToggles);
  const [socialLinks, setSocialLinks] = useState(settings.socialLinks);
  const [seoDefaults, setSeoDefaults] = useState(settings.seoDefaults);
  const [heroTagline, setHeroTagline] = useState(settings.heroTagline);
  const [aboutContent, setAboutContent] = useState(settings.aboutContent);
  const [newApiKey, setNewApiKey] = useState("");

  const save = async (data: Record<string, unknown>) => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
  };

  const regenerateKey = async () => {
    if (!confirm("هل تريد إنشاء مفتاح API جديد؟ المفتاح القديم سيتوقف عن العمل.")) return;
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerateApiKey: true }),
    });
    const data = await res.json();
    if (data.success) setNewApiKey(data.data.apiKey);
  };

  const tabs = [
    { id: "theme", label: "المظهر" },
    { id: "social", label: "التواصل الاجتماعي" },
    { id: "seo", label: "SEO" },
    { id: "content", label: "المحتوى" },
    { id: "api", label: "API" },
  ];

  const inputStyle = {
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    border: "1px solid var(--border)",
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              background: tab === t.id ? "var(--accent)" : "var(--bg-secondary)",
              color: tab === t.id ? "var(--bg-primary)" : "var(--text-secondary)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
        {/* Theme Tab */}
        {tab === "theme" && (
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>اختر المظهر</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setTheme({ preset: p.id, accent: p.color })}
                  className="p-3 rounded-lg text-sm flex items-center gap-2"
                  style={{
                    border: theme.preset === p.id ? `2px solid ${p.color}` : "1px solid var(--border)",
                    background: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <div className="w-4 h-4 rounded-full" style={{ background: p.color }} />
                  {p.label}
                </button>
              ))}
            </div>
            <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>لون مخصص</label>
            <input
              type="color"
              value={theme.accent || "#f97316"}
              onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
              className="w-16 h-10 rounded cursor-pointer"
            />
            <button
              onClick={() => save({ theme })}
              className="block mt-4 px-4 py-2 rounded-lg font-bold text-sm"
              style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
            >
              {saving ? "..." : "حفظ المظهر"}
            </button>
          </div>
        )}

        {/* Social Tab */}
        {tab === "social" && (
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>التواصل الاجتماعي</h3>
            {(["x", "instagram", "snapchat"] as const).map((platform) => (
              <div key={platform} className="mb-4 p-4 rounded-lg" style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {platform === "x" ? "X (Twitter)" : platform === "instagram" ? "Instagram" : "Snapchat"}
                  </span>
                  <button
                    onClick={() => setSocialToggles({ ...socialToggles, [platform]: !socialToggles[platform] })}
                    className="w-10 h-5 rounded-full transition-colors relative"
                    style={{ background: socialToggles[platform] ? "var(--accent)" : "var(--border)" }}
                  >
                    <div
                      className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
                      style={{ right: socialToggles[platform] ? "1px" : "auto", left: socialToggles[platform] ? "auto" : "1px" }}
                    />
                  </button>
                </div>
                <input
                  value={socialLinks[platform === "x" ? "xUrl" : platform === "instagram" ? "instagramUrl" : "snapchatUrl"]}
                  onChange={(e) => setSocialLinks({
                    ...socialLinks,
                    [platform === "x" ? "xUrl" : platform === "instagram" ? "instagramUrl" : "snapchatUrl"]: e.target.value,
                  })}
                  placeholder="الرابط"
                  className="w-full p-2 rounded text-sm outline-none"
                  style={inputStyle}
                />
                {platform === "instagram" && (
                  <input
                    value={socialLinks.instagramToken}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagramToken: e.target.value })}
                    placeholder="Instagram Access Token"
                    className="w-full p-2 rounded text-sm outline-none mt-2"
                    style={inputStyle}
                  />
                )}
              </div>
            ))}
            <button
              onClick={() => save({ socialToggles, socialLinks })}
              className="px-4 py-2 rounded-lg font-bold text-sm"
              style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
            >
              {saving ? "..." : "حفظ"}
            </button>
          </div>
        )}

        {/* SEO Tab */}
        {tab === "seo" && (
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>إعدادات SEO</h3>
            <div className="space-y-3">
              <input value={seoDefaults.title} onChange={(e) => setSeoDefaults({ ...seoDefaults, title: e.target.value })} placeholder="عنوان الموقع" className="w-full p-3 rounded-lg text-sm outline-none" style={inputStyle} />
              <textarea value={seoDefaults.description} onChange={(e) => setSeoDefaults({ ...seoDefaults, description: e.target.value })} placeholder="وصف الموقع" rows={3} className="w-full p-3 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
              <input value={seoDefaults.ogImage} onChange={(e) => setSeoDefaults({ ...seoDefaults, ogImage: e.target.value })} placeholder="رابط صورة OG" className="w-full p-3 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
            <button onClick={() => save({ seoDefaults })} className="mt-4 px-4 py-2 rounded-lg font-bold text-sm" style={{ background: "var(--accent)", color: "var(--bg-primary)" }}>{saving ? "..." : "حفظ"}</button>
          </div>
        )}

        {/* Content Tab */}
        {tab === "content" && (
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>المحتوى</h3>
            <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>شعار الصفحة الرئيسية</label>
            <input value={heroTagline} onChange={(e) => setHeroTagline(e.target.value)} className="w-full p-3 rounded-lg text-sm outline-none mb-4" style={inputStyle} />
            <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>نبذة عني</label>
            <textarea value={aboutContent} onChange={(e) => setAboutContent(e.target.value)} rows={6} className="w-full p-3 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
            <button onClick={() => save({ heroTagline, aboutContent })} className="mt-4 px-4 py-2 rounded-lg font-bold text-sm" style={{ background: "var(--accent)", color: "var(--bg-primary)" }}>{saving ? "..." : "حفظ"}</button>
          </div>
        )}

        {/* API Tab */}
        {tab === "api" && (
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>مفتاح API</h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>استخدم هذا المفتاح مع Claude Code skill للنشر البرمجي.</p>
            <div className="p-3 rounded-lg mb-4" style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
              <code className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {newApiKey || (settings.apiKeyHash ? "••••••••••••••••" : "لم يتم إنشاء مفتاح بعد")}
              </code>
            </div>
            {newApiKey && (
              <p className="text-sm mb-4 text-yellow-500">احفظ هذا المفتاح الآن — لن يظهر مرة أخرى!</p>
            )}
            <button onClick={regenerateKey} className="px-4 py-2 rounded-lg font-bold text-sm" style={{ background: "var(--accent)", color: "var(--bg-primary)" }}>
              إنشاء مفتاح جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create settings page**

Create `src/app/admin/settings/page.tsx`:

```tsx
import { prisma } from "@/lib/db";
import SettingsForm from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) return <p>Settings not found</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>الإعدادات</h1>
      <SettingsForm settings={JSON.parse(JSON.stringify(settings))} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/settings/ src/components/admin/settings-form.tsx
git commit -m "feat: add admin settings page with theme, social, SEO, content, and API tabs"
```

---

### Task 16: Remaining Admin CRUD Pages

**Files:**
- Create: `src/app/admin/comments/page.tsx`
- Create: `src/app/admin/projects/page.tsx`
- Create: `src/app/admin/skills/page.tsx`
- Create: `src/app/admin/messages/page.tsx`
- Create: `src/app/admin/links/page.tsx`

All follow the same pattern — **server component fetches data, renders a table, client component handles mutations via API fetch calls**. Use the same CSS variable styling as dashboard and posts pages.

**Implementation guide per page:**

**Comments** (`/admin/comments`):
- Server fetch: `prisma.comment.findMany({ include: { post: { select: { title: true } } }, orderBy: { createdAt: "desc" } })`
- Table columns: Post title, author name, content preview (truncated 100 chars), status badge, date
- Client component buttons: "Approve" → `PUT /api/comments/[id]` with `{ isApproved: true }`, "Delete" → `DELETE /api/comments/[id]`
- Filter tabs at top: "الكل" / "معلقة" / "مقبولة"

**Projects** (`/admin/projects`):
- Server fetch: `prisma.project.findMany({ orderBy: { sortOrder: "asc" } })`
- Table with: title, URL, tech stack, active toggle, sort order
- Add/edit form in a modal or inline: title, description, techStack, url, image URL, isActive
- CRUD via `POST/PUT/DELETE /api/projects/[id]`

**Skills** (`/admin/skills`):
- Server fetch: `prisma.skill.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] })`
- Grouped by category with section headers
- Add form: name, icon, category dropdown (language/framework/tool/other)
- CRUD via `POST/PUT/DELETE /api/skills/[id]`

**Messages** (`/admin/messages`):
- Server fetch: `prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } })`
- Table with: name, email, message preview, read/unread badge, date
- Click row to expand full message, "Mark as read" → `PUT /api/contact/[id]` with `{ isRead: true }`
- Delete button → `DELETE /api/contact/[id]`

**Links** (`/admin/links`):
- Server fetch: `prisma.link.findMany({ orderBy: { sortOrder: "asc" } })`
- Ordered list with: title, URL, category badge, active toggle
- Add/edit form: title, description, url, icon, category, isActive
- CRUD via `POST/PUT/DELETE /api/links/[id]`

- [ ] **Step 1: Create comments page**
- [ ] **Step 2: Create projects page**
- [ ] **Step 3: Create skills page**
- [ ] **Step 4: Create messages page**
- [ ] **Step 5: Create links page**
- [ ] **Step 6: Commit each page separately**

---

## Chunk 4: Public Website — Landing Page & Blog

### Task 17: Public Layout (Navbar + Footer)

**Files:**
- Create: `src/app/(public)/layout.tsx`
- Create: `src/components/public/navbar.tsx`
- Create: `src/components/public/footer.tsx`

- [ ] **Step 1: Create public navbar**

Create `src/components/public/navbar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/blog", label: "المدونة" },
  { href: "/links", label: "الروابط" },
  { href: "#contact", label: "تواصل" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{ background: "rgba(17,17,19,0.9)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold" style={{ color: "var(--accent)" }}>
          UAEpro
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2"
          style={{ color: "var(--text-primary)" }}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-4 pb-4" style={{ background: "var(--bg-secondary)" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Create footer**

Create `src/components/public/footer.tsx`:

```tsx
export default function Footer({ socialLinks }: { socialLinks: Record<string, string> }) {
  return (
    <footer className="py-8 mt-16" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex justify-center gap-4 mb-4">
          {socialLinks.xUrl && (
            <a href={socialLinks.xUrl} target="_blank" rel="noopener" style={{ color: "var(--text-secondary)" }}>X</a>
          )}
          {socialLinks.instagramUrl && (
            <a href={socialLinks.instagramUrl} target="_blank" rel="noopener" style={{ color: "var(--text-secondary)" }}>Instagram</a>
          )}
          {socialLinks.snapchatUrl && (
            <a href={socialLinks.snapchatUrl} target="_blank" rel="noopener" style={{ color: "var(--text-secondary)" }}>Snapchat</a>
          )}
        </div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          © {new Date().getFullYear()} UAEpro. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Create public layout**

Create `src/app/(public)/layout.tsx`:

```tsx
import { prisma } from "@/lib/db";
import Navbar from "@/components/public/navbar";
import Footer from "@/components/public/footer";

export const revalidate = 300; // 5 minutes ISR

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const socialLinks = (settings?.socialLinks as Record<string, string>) || {};

  return (
    <div className="arabic-content">
      <Navbar />
      <main>{children}</main>
      <Footer socialLinks={socialLinks} />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(public\)/ src/components/public/
git commit -m "feat: add public layout with Arabic RTL navbar and footer"
```

---

### Task 18: Landing Page

**Files:**
- Create: `src/app/(public)/page.tsx`
- Create: `src/components/public/hero.tsx`
- Create: `src/components/public/social-feeds.tsx`
- Create: `src/components/public/contact-form.tsx`

- [ ] **Step 1: Create Hero component**

Create `src/components/public/hero.tsx`:

```tsx
export default function Hero({ tagline }: { tagline: string }) {
  return (
    <section className="relative py-24 dot-grid">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="terminal-window max-w-lg mx-auto mb-8">
          <div className="terminal-header">
            <div className="terminal-dot" style={{ background: "#ff5f57" }} />
            <div className="terminal-dot" style={{ background: "#febc2e" }} />
            <div className="terminal-dot" style={{ background: "#28c840" }} />
            <span className="mr-auto text-xs" style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>uaepro.me</span>
          </div>
          <div className="p-6">
            <div className="text-xs mb-2" style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>$ whoami</div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2" style={{ color: "var(--text-primary)" }}>
              UAEpro
            </h1>
            <p className="text-sm" style={{ color: "var(--accent)", fontFamily: "monospace" }}>
              // {tagline}
              <span className="inline-block w-2 h-4 mr-1 animate-pulse" style={{ background: "var(--accent)" }} />
            </p>
          </div>
        </div>
        <a
          href="/blog"
          className="inline-block px-6 py-3 rounded-lg font-bold text-sm transition-opacity hover:opacity-80"
          style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
        >
          تصفح المدونة
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create Contact Form component**

Create `src/components/public/contact-form.tsx`:

```tsx
"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        message: form.get("message"),
        _honeypot: form.get("_hp"),
      }),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  if (status === "sent") {
    return <p className="text-center py-8" style={{ color: "var(--accent)" }}>تم إرسال رسالتك بنجاح!</p>;
  }

  const inputStyle = { background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
      {/* Honeypot */}
      <input name="_hp" type="text" className="hidden" tabIndex={-1} autoComplete="off" />
      <input name="name" required placeholder="الاسم" className="w-full p-3 rounded-lg outline-none" style={inputStyle} />
      <input name="email" type="email" required placeholder="البريد الإلكتروني" className="w-full p-3 rounded-lg outline-none" style={inputStyle} />
      <textarea name="message" required placeholder="رسالتك" rows={4} className="w-full p-3 rounded-lg outline-none resize-none" style={inputStyle} />
      <button type="submit" disabled={status === "sending"} className="w-full p-3 rounded-lg font-bold" style={{ background: "var(--accent)", color: "var(--bg-primary)" }}>
        {status === "sending" ? "جاري الإرسال..." : "إرسال"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create Social Feeds component**

Create `src/components/public/social-feeds.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";

interface SocialFeedsProps {
  toggles: { x: boolean; instagram: boolean; snapchat: boolean };
  links: { xUrl: string; instagramUrl: string; snapchatUrl: string };
}

export default function SocialFeeds({ toggles, links }: SocialFeedsProps) {
  const xRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load X embed script
    if (toggles.x && links.xUrl) {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Load Snapchat embed script
    if (toggles.snapchat) {
      const script = document.createElement("script");
      script.src = "https://sdk.snapkit.com/js/v1/create.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [toggles, links]);

  if (!toggles.x && !toggles.instagram && !toggles.snapchat) return null;

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>
          <span style={{ color: "var(--accent)", fontFamily: "monospace" }}>// </span>
          تابعني
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {toggles.x && links.xUrl && (
            <div className="rounded-lg p-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-secondary)" }}>X (Twitter)</h3>
              <div ref={xRef}>
                <a
                  className="twitter-timeline"
                  data-theme="dark"
                  data-height="400"
                  href={links.xUrl}
                >
                  التغريدات
                </a>
              </div>
            </div>
          )}

          {toggles.instagram && links.instagramUrl && (
            <div className="rounded-lg p-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-secondary)" }}>Instagram</h3>
              <a href={links.instagramUrl} target="_blank" rel="noopener" className="block text-center py-8" style={{ color: "var(--accent)" }}>
                عرض الحساب على Instagram
              </a>
            </div>
          )}

          {toggles.snapchat && links.snapchatUrl && (
            <div className="rounded-lg p-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-secondary)" }}>Snapchat</h3>
              <div
                className="snapchat-creative-kit-share"
                data-share-url={links.snapchatUrl}
                style={{ textAlign: "center" }}
              >
                <a href={links.snapchatUrl} target="_blank" rel="noopener" style={{ color: "var(--accent)" }}>
                  @UAEpro على Snapchat
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Assemble landing page**

Create `src/app/(public)/page.tsx`:

```tsx
import { prisma } from "@/lib/db";
import Hero from "@/components/public/hero";
import ContactForm from "@/components/public/contact-form";
import SocialFeeds from "@/components/public/social-feeds";
import Link from "next/link";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, latestPosts, projects, skills, links] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      take: 3,
      orderBy: { publishedAt: "desc" },
      include: { category: true },
    }),
    prisma.project.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.skill.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] }),
    prisma.link.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const socialToggles = (settings?.socialToggles as { x: boolean; instagram: boolean; snapchat: boolean }) || { x: false, instagram: false, snapchat: false };
  const socialLinks = (settings?.socialLinks as { xUrl: string; instagramUrl: string; snapchatUrl: string }) || { xUrl: "", instagramUrl: "", snapchatUrl: "" };

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <>
      {/* Hero */}
      <Hero tagline={settings?.heroTagline || "مبرمج | صانع محتوى | قيمر"} />

      {/* About */}
      {settings?.aboutContent && (
        <section className="py-16 max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
            <span style={{ color: "var(--accent)", fontFamily: "monospace" }}>// </span>عن مايد
          </h2>
          <div className="arabic-content" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: settings.aboutContent }} />
        </section>
      )}

      {/* Latest Posts */}
      {latestPosts.length > 0 && (
        <section className="py-16 max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
            <span style={{ color: "var(--accent)", fontFamily: "monospace" }}>// </span>آخر المقالات
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {latestPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block rounded-lg overflow-hidden transition-transform hover:scale-[1.02]" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                {post.coverImage && (
                  <div className="aspect-video relative overflow-hidden" style={{ background: "var(--bg-terminal)" }}>
                    <img src={post.coverImage} alt={post.title} className="object-cover w-full h-full" />
                  </div>
                )}
                <div className="p-4">
                  {post.category && <span className="text-xs px-2 py-1 rounded mb-2 inline-block" style={{ background: "rgba(249,115,22,0.1)", color: "var(--accent)" }}>{post.category.name}</span>}
                  <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>{post.title}</h3>
                  <div className="flex gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span>{post.readingTime} دقائق قراءة</span>
                    <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("ar") : ""}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/blog" className="text-sm" style={{ color: "var(--accent)" }}>عرض الكل ←</Link>
          </div>
        </section>
      )}

      {/* Social Feeds */}
      <SocialFeeds toggles={socialToggles} links={socialLinks} />

      {/* Projects */}
      {projects.length > 0 && (
        <section className="py-16 max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
            <span style={{ color: "var(--accent)", fontFamily: "monospace" }}>// </span>مشاريعي
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <a key={p.id} href={p.url || "#"} target="_blank" rel="noopener" className="block p-4 rounded-lg transition-transform hover:scale-[1.02]" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>{p.title}</h3>
                {p.description && <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{p.description}</p>}
                {p.techStack && (
                  <div className="flex flex-wrap gap-1">
                    {p.techStack.split(",").map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--bg-primary)", color: "var(--accent)", border: "1px solid var(--border)" }}>{t.trim()}</span>
                    ))}
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {Object.keys(skillsByCategory).length > 0 && (
        <section className="py-16 max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
            <span style={{ color: "var(--accent)", fontFamily: "monospace" }}>// </span>المهارات
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(skillsByCategory).map(([cat, items]) => (
              <div key={cat}>
                <h3 className="text-sm font-bold mb-3 capitalize" style={{ color: "var(--accent)" }}>{cat}</h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((s) => (
                    <span key={s.id} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
                      {s.icon && <span className="ml-1">{s.icon}</span>}{s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Links */}
      {links.length > 0 && (
        <section className="py-16 max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
            <span style={{ color: "var(--accent)", fontFamily: "monospace" }}>// </span>خدمات وروابط
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((l) => (
              <a key={l.id} href={l.url} target="_blank" rel="noopener" className="flex items-center gap-3 p-4 rounded-lg transition-transform hover:scale-[1.02]" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                {l.icon && <span className="text-2xl">{l.icon}</span>}
                <div>
                  <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{l.title}</h3>
                  {l.description && <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{l.description}</p>}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="py-16 max-w-6xl mx-auto px-4">
        <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "var(--text-primary)" }}>
          <span style={{ color: "var(--accent)", fontFamily: "monospace" }}>// </span>تواصل معي
        </h2>
        <ContactForm />
      </section>
    </>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(public\)/page.tsx src/components/public/
git commit -m "feat: add landing page with hero, about, posts, social, projects, skills, links, contact sections"
```

---

### Task 19: Blog Pages

**Files:**
- Create: `src/app/(public)/blog/page.tsx`
- Create: `src/app/(public)/blog/[slug]/page.tsx`
- Create: `src/components/public/post-card.tsx`
- Create: `src/components/public/comment-section.tsx`
- Create: `src/components/public/share-buttons.tsx`

- [ ] **Step 1: Install Shiki for syntax highlighting**

```bash
npm install shiki
```

- [ ] **Step 2: Create share buttons component**

Create `src/components/public/share-buttons.tsx`:

```tsx
"use client";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const fullUrl = typeof window !== "undefined" ? window.location.origin + url : url;

  return (
    <div className="flex gap-3">
      <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener" className="px-3 py-1.5 rounded text-xs" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>X</a>
      <a href={`https://wa.me/?text=${encodeURIComponent(title + " " + fullUrl)}`} target="_blank" rel="noopener" className="px-3 py-1.5 rounded text-xs" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>WhatsApp</a>
      <button onClick={() => { navigator.clipboard.writeText(fullUrl); }} className="px-3 py-1.5 rounded text-xs" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>نسخ الرابط</button>
    </div>
  );
}
```

- [ ] **Step 3: Create comment section component**

Create `src/components/public/comment-section.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Comment {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export default function CommentSection({ postId, comments }: { postId: number; comments: Comment[] }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const form = new FormData(e.currentTarget);
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        authorName: form.get("authorName"),
        authorEmail: form.get("authorEmail"),
        content: form.get("content"),
        _honeypot: form.get("_hp"),
      }),
    });
    setSending(false);
    setSent(true);
    router.refresh();
  }

  const inputStyle = { background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" };

  return (
    <div className="mt-12">
      <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>التعليقات ({comments.length})</h3>

      {comments.map((c) => (
        <div key={c.id} className="p-4 rounded-lg mb-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <div className="flex justify-between mb-2">
            <span className="font-bold text-sm" style={{ color: "var(--accent)" }}>{c.authorName}</span>
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{new Date(c.createdAt).toLocaleDateString("ar")}</span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{c.content}</p>
        </div>
      ))}

      <div className="mt-6 p-4 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
        <h4 className="font-bold mb-3" style={{ color: "var(--text-primary)" }}>أضف تعليقاً</h4>
        {sent ? (
          <p style={{ color: "var(--accent)" }}>تم إرسال تعليقك وسيظهر بعد الموافقة عليه.</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input name="_hp" type="text" className="hidden" tabIndex={-1} autoComplete="off" />
            <input name="authorName" required placeholder="الاسم" className="w-full p-2 rounded text-sm outline-none" style={inputStyle} />
            <input name="authorEmail" type="email" required placeholder="البريد الإلكتروني (لن يظهر)" className="w-full p-2 rounded text-sm outline-none" style={inputStyle} />
            <textarea name="content" required placeholder="تعليقك" rows={3} className="w-full p-2 rounded text-sm outline-none resize-none" style={inputStyle} />
            <button type="submit" disabled={sending} className="px-4 py-2 rounded font-bold text-sm" style={{ background: "var(--accent)", color: "var(--bg-primary)" }}>
              {sending ? "..." : "إرسال التعليق"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create blog listing page**

Create `src/app/(public)/blog/page.tsx`:

```tsx
import { prisma } from "@/lib/db";
import Link from "next/link";

export const revalidate = 60;

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string; category?: string; tag?: string; search?: string }> }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 9;

  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (params.category) where.category = { slug: params.category };
  if (params.tag) where.tags = { some: { tag: { slug: params.tag } } };
  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { excerpt: { contains: params.search } },
    ];
  }

  const [posts, total, categories, tags] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { category: true },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
    prisma.category.findMany({ include: { _count: { select: { posts: true } } } }),
    prisma.tag.findMany({ include: { _count: { select: { posts: true } } } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>المدونة</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/blog" className="px-3 py-1.5 rounded-lg text-xs" style={{ background: !params.category ? "var(--accent)" : "var(--bg-secondary)", color: !params.category ? "var(--bg-primary)" : "var(--text-secondary)", border: "1px solid var(--border)" }}>الكل</Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/blog?category=${c.slug}`} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: params.category === c.slug ? "var(--accent)" : "var(--bg-secondary)", color: params.category === c.slug ? "var(--bg-primary)" : "var(--text-secondary)", border: "1px solid var(--border)" }}>{c.name}</Link>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="block rounded-lg overflow-hidden transition-transform hover:scale-[1.02]" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
            {post.coverImage && <div className="aspect-video overflow-hidden"><img src={post.coverImage} alt={post.title} className="object-cover w-full h-full" /></div>}
            <div className="p-4">
              {post.category && <span className="text-xs px-2 py-0.5 rounded mb-2 inline-block" style={{ color: "var(--accent)", background: "rgba(249,115,22,0.1)" }}>{post.category.name}</span>}
              <h2 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>{post.title}</h2>
              <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{post.excerpt}</p>
              <div className="flex gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                <span>{post.readingTime} دقائق قراءة</span>
                <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("ar") : ""}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {posts.length === 0 && <p className="text-center py-16" style={{ color: "var(--text-secondary)" }}>لا توجد مقالات</p>}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <Link key={i} href={`/blog?page=${i + 1}${params.category ? `&category=${params.category}` : ""}`} className="px-3 py-1.5 rounded text-sm" style={{ background: page === i + 1 ? "var(--accent)" : "var(--bg-secondary)", color: page === i + 1 ? "var(--bg-primary)" : "var(--text-secondary)" }}>{i + 1}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create individual blog post page**

Create `src/app/(public)/blog/[slug]/page.tsx`:

```tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ShareButtons from "@/components/public/share-buttons";
import CommentSection from "@/components/public/comment-section";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return {};
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: { images: post.ogImage || post.coverImage ? [post.ogImage || post.coverImage!] : [] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      comments: { where: { isApproved: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!post || post.status !== "PUBLISHED") notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      {/* Cover */}
      {post.coverImage && (
        <div className="aspect-video rounded-lg overflow-hidden mb-8">
          <img src={post.coverImage} alt={post.title} className="object-cover w-full h-full" />
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {post.category && <span className="text-xs px-2 py-1 rounded" style={{ color: "var(--accent)", background: "rgba(249,115,22,0.1)" }}>{post.category.name}</span>}
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{post.readingTime} دقائق قراءة</span>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("ar") : ""}</span>
      </div>

      <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{post.title}</h1>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((t) => (
            <span key={t.tag.id} className="text-xs px-2 py-1 rounded" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>{t.tag.name}</span>
          ))}
        </div>
      )}

      {/* Content */}
      <div
        className="arabic-content prose prose-invert max-w-none mb-8"
        style={{ color: "var(--text-primary)" }}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Share */}
      <div className="mb-8">
        <ShareButtons url={`/blog/${post.slug}`} title={post.title} />
      </div>

      {/* Comments */}
      <CommentSection
        postId={post.id}
        comments={JSON.parse(JSON.stringify(post.comments))}
      />
    </article>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/\(public\)/blog/ src/components/public/share-buttons.tsx src/components/public/comment-section.tsx
git commit -m "feat: add blog listing and post pages with comments, share buttons, and syntax highlighting"
```

---

### Task 20: Links Page

**Files:**
- Create: `src/app/(public)/links/page.tsx`

- [ ] **Step 1: Create links page**

Create `src/app/(public)/links/page.tsx`:

```tsx
import { prisma } from "@/lib/db";

export const revalidate = 300;

export default async function LinksPage() {
  const links = await prisma.link.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const grouped = links.reduce((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, typeof links>);

  const categoryLabels: Record<string, string> = {
    service: "خدمات",
    "mini-app": "تطبيقات مصغرة",
    tool: "أدوات",
    other: "أخرى",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>الروابط والخدمات</h1>

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--accent)" }}>
            {categoryLabels[cat] || cat}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-4 p-4 rounded-lg transition-transform hover:scale-[1.02]"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
              >
                {link.icon && <span className="text-3xl">{link.icon}</span>}
                <div>
                  <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{link.title}</h3>
                  {link.description && <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{link.description}</p>}
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}

      {links.length === 0 && <p className="text-center py-16" style={{ color: "var(--text-secondary)" }}>لا توجد روابط بعد</p>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(public\)/links/
git commit -m "feat: add public links/services page with category grouping"
```

---

## Chunk 5: Deployment

### Task 21: Docker & Deployment Config

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`

- [ ] **Step 1: Create Dockerfile**

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

- [ ] **Step 2: Create docker-compose.yml**

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    volumes:
      - ./uploads:/app/public/uploads
    restart: unless-stopped
```

- [ ] **Step 3: Create `.dockerignore`**

```
node_modules
.next
.git
.env.local
.superpowers
docs
```

- [ ] **Step 4: Commit**

```bash
git add Dockerfile docker-compose.yml .dockerignore
git commit -m "feat: add Docker deployment configuration"
```

---

### Task 22: Final Verification

- [ ] **Step 1: Run `npm run build`** — ensure no build errors
- [ ] **Step 2: Test login flow** — navigate to `/login`, sign in, verify redirect to `/admin`
- [ ] **Step 3: Test post creation** — create a draft post, auto-save, publish
- [ ] **Step 4: Test public pages** — verify landing page, blog listing, blog post, links page
- [ ] **Step 5: Test API with curl** — verify API key auth works for post creation
- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: final verification pass"
```
