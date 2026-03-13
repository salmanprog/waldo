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

export async function GET(req: Request) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ code: 401, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get("perPage") || "10", 10)));
    const skip = (page - 1) * perPage;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: perPage,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, lname: true, slug: true, platoon: true } },
          items: { select: { id: true, title: true, quantity: true, price: true } },
        },
      }),
      prisma.order.count(),
    ]);

    const data = orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      user: order.user
        ? {
            name: [order.user.name, order.user.lname].filter(Boolean).join(" ") || null,
            slug: order.user.slug,
            platoon: order.user.platoon,
          }
        : null,
      platoonNumber: order.platoonNumber,
      purchaseDate: order.purchaseDate,
      total: order.total,
      status: order.status,
      stripeSessionId: order.stripeSessionId,
      createdAt: order.createdAt,
      itemsCount: order.items.length,
      items: order.items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
    }));

    const lastPage = Math.ceil(total / perPage) || 1;

    return NextResponse.json({
      code: 200,
      message: "OK",
      data,
      meta: {
        total,
        perPage,
        currentPage: page,
        lastPage,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { code: 500, message: (err as Error).message, data: [], meta: null },
      { status: 500 }
    );
  }
}
