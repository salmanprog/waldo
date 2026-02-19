export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/jwt";
export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  const slugParam = params.slug ? decodeURIComponent(params.slug) : "";

  if (!slugParam) {
    return NextResponse.json(
      { code: 400, message: "Gallery slug or path is required" },
      { status: 400 }
    );
  }

  try {
    const authHeader = _req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1] || null;
    if (!token) {
      return NextResponse.json(
        { code: 401, message: "Authorization required" },
        { status: 401 }
      );
    }
    const decoded = await verifyToken(token);
    if (!decoded || typeof decoded === "string") {
      return NextResponse.json(
        { code: 401, message: "Invalid token" },
        { status: 401 }
      );
    }

    const gallery = await prisma.gallery.findFirst({
      where: {
        deletedAt: null,
        status: true,
        OR: [
          { slug: slugParam },
          { galleryPath: { endsWith: slugParam } },
          { galleryPath: { equals: `/uploads/gallery/${slugParam}` } },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        face_recognition_heading: true,
        is_face_recognition: true,
        galleryPath: true,
      },
    });

    if (!gallery) {
      return NextResponse.json(
        { code: 404, message: "Gallery not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 200,
      message: "success",
      data: {
        id: gallery.id,
        slug: gallery.slug,
        title: gallery.title,
        face_recognition_heading: gallery.face_recognition_heading ?? null,
        is_face_recognition: gallery.is_face_recognition,
        galleryPath: gallery.galleryPath,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      {
        code: 500,
        message: "Internal Server Error",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
