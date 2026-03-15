import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { success, error } from "@/lib/api";
import path from "path";
import fs from "fs/promises";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (!user) return error("Unauthorized", 401);

  const { id } = await params;
  const mediaId = parseInt(id);
  if (isNaN(mediaId)) return error("Invalid ID");

  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) return error("Media not found", 404);

  // Delete file from disk
  const filePath = path.join(process.cwd(), "public", media.url);
  try {
    await fs.unlink(filePath);
  } catch {
    // File may already be gone; continue with DB deletion
  }

  // Also attempt to delete WebP variant if it exists
  const ext = path.extname(media.url);
  const webpPath = filePath.replace(new RegExp(`${ext}$`), ".webp");
  const uuidPrefix = media.filename.split("-")[0];
  // Only delete webp if it follows our naming convention
  if (uuidPrefix && webpPath !== filePath) {
    try {
      await fs.unlink(webpPath);
    } catch {
      // Ignore
    }
  }

  await prisma.media.delete({ where: { id: mediaId } });
  return success({ deleted: true });
}
