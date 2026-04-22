export const runtime = "nodejs";

import { NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/jwt";
import { generateSlug } from "@/utils/slug";

const ALLOWED_EXT = /\.(jpe?g|png|webp)$/i;

async function assertAuth(req: Request) {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ code: 401, message: "Unauthorized" }, { status: 401 });
  }
  const decoded = await verifyToken(token);
  if (!decoded || typeof decoded === "string") {
    return NextResponse.json({ code: 401, message: "Invalid token" }, { status: 401 });
  }
  return null;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await assertAuth(req);
  if (authError) return authError;

  const { id: idParam } = await params;
  const bookId = parseInt(idParam, 10);
  if (Number.isNaN(bookId) || bookId < 1) {
    return NextResponse.json({ code: 400, message: "Invalid book id" }, { status: 400 });
  }

  const book = await prisma.coffeeTableBook.findFirst({
    where: { id: bookId, deletedAt: null },
  });
  if (!book) {
    return NextResponse.json({ code: 404, message: "Coffee table book not found" }, { status: 404 });
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { code: 415, message: "Expected multipart/form-data with field `image`" },
      { status: 415 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ code: 422, message: "Image file is required" }, { status: 422 });
  }

  const originalName = file.name || "upload";
  if (!ALLOWED_EXT.test(originalName)) {
    return NextResponse.json(
      { code: 422, message: "Only JPG, PNG, or WEBP images are allowed" },
      { status: 422 }
    );
  }

  try {
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "coffee-table-book",
      String(bookId)
    );
    await fs.mkdir(uploadDir, { recursive: true });

    const safeBase = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${Date.now()}-admin-${safeBase}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const publicPath = `/uploads/coffee-table-book/${bookId}/${fileName}`;
    const image = await prisma.coffeeTableBookImage.create({
      data: {
        slug: await generateSlug(
          "coffeeTableBookImage" as any,
          `image-${bookId}-${Date.now()}`
        ),
        coffeTableBookId: bookId,
        imageUrl: publicPath,
      },
    });

    return NextResponse.json(
      {
        code: 200,
        message: "Image uploaded successfully",
        data: { id: image.id, slug: image.slug, imageUrl: image.imageUrl },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Admin coffee table book image upload:", err);
    return NextResponse.json(
      { code: 500, message: (err as Error).message || "Upload failed" },
      { status: 500 }
    );
  }
}
