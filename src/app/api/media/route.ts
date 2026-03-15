import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, created, error, paginated, parseSearchParams } from "@/lib/api";
import { sanitizeFilename } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { page, limit } = parseSearchParams(req.url);

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.media.count(),
  ]);

  return paginated(media, total, page, limit);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return error("No file provided");
  if (!ALLOWED_TYPES.includes(file.type)) {
    return error(`File type not allowed. Allowed: ${ALLOWED_TYPES.join(", ")}`);
  }
  if (file.size > MAX_SIZE) return error("File too large. Max 10MB");

  const buffer = Buffer.from(await file.arrayBuffer());

  // Build upload path: public/uploads/YYYY/MM/
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const uploadDir = path.join(process.cwd(), "public", "uploads", year, month);
  await fs.mkdir(uploadDir, { recursive: true });

  const sanitized = sanitizeFilename(file.name);
  const uuid = uuidv4();
  const filename = `${uuid}-${sanitized}`;
  const filePath = path.join(uploadDir, filename);
  const urlPath = `/uploads/${year}/${month}/${filename}`;

  await fs.writeFile(filePath, buffer);

  // For images: resize if > 2000px wide and generate WebP variant
  let webpUrl: string | null = null;
  if (IMAGE_TYPES.includes(file.type) && file.type !== "image/gif") {
    try {
      const img = sharp(buffer);
      const meta = await img.metadata();

      if (meta.width && meta.width > 2000) {
        const resized = await img.resize({ width: 2000, withoutEnlargement: true }).toBuffer();
        await fs.writeFile(filePath, resized);
      }

      // Generate WebP variant
      const webpFilename = `${uuid}-${sanitizeFilename(file.name.replace(/\.[^.]+$/, ""))}.webp`;
      const webpPath = path.join(uploadDir, webpFilename);
      await sharp(buffer).resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 85 }).toFile(webpPath);
      webpUrl = `/uploads/${year}/${month}/${webpFilename}`;
    } catch {
      // Sharp processing is best-effort; file is still saved
    }
  }

  const media = await prisma.media.create({
    data: {
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: urlPath,
      alt: formData.get("alt") as string || null,
    },
  });

  return created({ ...media, webpUrl });
}
