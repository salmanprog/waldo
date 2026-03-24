export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      where: { deletedAt: null, status: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ code: 200, message: "OK", data: companies });
  } catch (err) {
    return NextResponse.json(
      { code: 500, message: (err as Error).message, data: [] },
      { status: 500 }
    );
  }
}
