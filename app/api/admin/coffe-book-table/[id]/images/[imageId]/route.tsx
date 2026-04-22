export const runtime = "nodejs";

import { NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/jwt";

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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const authError = await assertAuth(req);
  if (authError) return authError;

  const { id: idParam, imageId: imageIdParam } = await params;
  const bookId = parseInt(idParam, 10);
  const imageId = parseInt(imageIdParam, 10);
  if (Number.isNaN(bookId) || bookId < 1 || Number.isNaN(imageId) || imageId < 1) {
    return NextResponse.json({ code: 400, message: "Invalid id" }, { status: 400 });
  }

  const image = await prisma.coffeeTableBookImage.findFirst({
    where: {
      id: imageId,
      coffeTableBookId: bookId,
      deletedAt: null,
    },
  });

  if (!image) {
    return NextResponse.json({ code: 404, message: "Image not found" }, { status: 404 });
  }

  try {
    if (image.imageUrl.startsWith("/uploads/coffee-table-book/")) {
      const diskPath = path.join(process.cwd(), "public", image.imageUrl.replace(/^\//, ""));
      try {
        await fs.unlink(diskPath);
      } catch {
        // file may already be missing
      }
    }

    await prisma.coffeeTableBookImage.update({
      where: { id: imageId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(
      { code: 200, message: "Image removed successfully", data: {} },
      { status: 200 }
    );
  } catch (err) {
    console.error("Admin coffee table book image delete:", err);
    return NextResponse.json(
      { code: 500, message: (err as Error).message || "Delete failed" },
      { status: 500 }
    );
  }
}
