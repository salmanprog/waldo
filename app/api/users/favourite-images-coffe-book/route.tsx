export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/jwt";
import { getUserByToken } from "@/utils/token";

async function getAuthUser(req: Request) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || typeof decoded === "string") return null;
  const user = await getUserByToken(token);
  return user;
}

// GET - List user's favourites (returns galleryImageIds for quick lookup)
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user?.id) {
      return NextResponse.json({ code: 401, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const galleryImageIds = searchParams.get("galleryImageIds"); // optional: filter by ids

    const where: { userId: number; galleryImageId?: { in: number[] } } = { userId: Number(user.id) };
    if (galleryImageIds) {
      const ids = galleryImageIds.split(",").map((id) => parseInt(id, 10)).filter((n) => !isNaN(n));
      if (ids.length > 0) {
        where.galleryImageId = { in: ids };
      }
    }

    const favourites = await prisma.favouriteImagesCoffeBook.findMany({
      where,
      select: { id: true, galleryImageId: true, galleryImagePath: true },
    });

    return NextResponse.json({ code: 200, message: "OK", data: favourites });
  } catch (err) {
    console.error("Favourite images GET error:", err);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (err as Error).message },
      { status: 500 }
    );
  }
}

// POST - Add to favourites
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user?.id) {
      return NextResponse.json({ code: 401, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { galleryImageId, galleryImagePath } = body;

    if (!galleryImageId || !galleryImagePath) {
      return NextResponse.json(
        { code: 422, message: "galleryImageId and galleryImagePath are required" },
        { status: 422 }
      );
    }

    const existing = await prisma.favouriteImagesCoffeBook.findFirst({
      where: { userId: Number(user.id), galleryImageId: Number(galleryImageId) },
    });

    if (existing) {
      return NextResponse.json({ code: 200, message: "Already in favourites", data: existing });
    }

    const favourite = await prisma.favouriteImagesCoffeBook.create({
      data: {
        userId: Number(user.id),
        galleryImageId: Number(galleryImageId),
        galleryImagePath: String(galleryImagePath),
      },
    });

    return NextResponse.json({ code: 200, message: "Added to favourites", data: favourite });
  } catch (err) {
    console.error("Favourite images POST error:", err);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (err as Error).message },
      { status: 500 }
    );
  }
}

// DELETE - Remove from favourites
export async function DELETE(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user?.id) {
      return NextResponse.json({ code: 401, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const galleryImageId = searchParams.get("galleryImageId");

    if (!galleryImageId) {
      return NextResponse.json(
        { code: 422, message: "galleryImageId is required" },
        { status: 422 }
      );
    }

    await prisma.favouriteImagesCoffeBook.deleteMany({
      where: {
        userId: Number(user.id),
        galleryImageId: parseInt(galleryImageId, 10),
      },
    });

    return NextResponse.json({ code: 200, message: "Removed from favourites", data: {} });
  } catch (err) {
    console.error("Favourite images DELETE error:", err);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (err as Error).message },
      { status: 500 }
    );
  }
}
