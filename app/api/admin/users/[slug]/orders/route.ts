export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/jwt";

async function getAdminFromRequest(req: Request): Promise<{ id: number } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  const decoded = await verifyToken(token);
  if (!decoded || typeof decoded === "string") return null;
  return { id: Number((decoded as { id?: string }).id) };
}

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ code: 401, message: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;
    const user = await prisma.user.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ code: 404, message: "User not found", data: [] }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    const data = orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      platoonNumber: order.platoonNumber,
      purchaseDate: order.purchaseDate,
      total: order.total,
      status: order.status,
      stripeSessionId: order.stripeSessionId,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        itemId: item.itemId,
        itemslug: item.itemslug,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        createdAt: item.createdAt,
      })),
    }));

    return NextResponse.json({ code: 200, message: "OK", data });
  } catch (err) {
    return NextResponse.json(
      { code: 500, message: (err as Error).message, data: [] },
      { status: 500 }
    );
  }
}
