export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      where: { deletedAt: null },
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });
    return NextResponse.json({ code: 200, message: "OK", data: categories });
  } catch (error: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
