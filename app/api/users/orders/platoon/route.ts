export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return NextResponse.json(
        { code: 401, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    // Verify token and get user - simple JWT decode or use your auth util
    const { verifyToken } = await import("@/utils/jwt");
    const decoded = (await verifyToken(token)) as { id?: string } | null;
    if (!decoded?.id) {
      return NextResponse.json(
        { code: 401, message: "Invalid token", data: null },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");
    if (!orderId) {
      return NextResponse.json(
        { code: 400, message: "orderId required", data: null },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId, 10),
        userId: parseInt(decoded.id, 10),
      },
      select: { platoonNumber: true },
    });

    if (!order) {
      return NextResponse.json(
        { code: 404, message: "Order not found", data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 200,
      message: "success",
      data: { platoonNumber: order.platoonNumber },
    });
  } catch (err) {
    console.error("[platoon route]", err);
    return NextResponse.json(
      { code: 500, message: "Server error", data: null },
      { status: 500 }
    );
  }
}
