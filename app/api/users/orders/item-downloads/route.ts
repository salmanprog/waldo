export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";
import { resolveOrderItemForDownloads } from "@/lib/orderDownload";

/**
 * OrderItem download counters for the current user's purchase.
 * Query: orderId + eventId, or galleryId (resolves event from Gallery).
 */
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

    const decoded = (await verifyToken(token)) as { id?: string } | null;
    if (!decoded?.id) {
      return NextResponse.json(
        { code: 401, message: "Invalid token", data: null },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const userId = parseInt(decoded.id, 10);
    const galleryIdRaw = url.searchParams.get("galleryId");
    const orderIdRaw = url.searchParams.get("orderId");
    const eventIdRaw = url.searchParams.get("eventId");

    let resolved:
      | Awaited<ReturnType<typeof resolveOrderItemForDownloads>>
      | null = null;

    if (galleryIdRaw) {
      const gid = parseInt(galleryIdRaw, 10);
      const orderIdOpt = orderIdRaw ? parseInt(orderIdRaw, 10) : NaN;
      if (isNaN(gid)) {
        return NextResponse.json(
          { code: 400, message: "Invalid galleryId", data: null },
          { status: 400 }
        );
      }
      resolved = await resolveOrderItemForDownloads(userId, {
        galleryId: gid,
        ...(!isNaN(orderIdOpt) && orderIdOpt > 0
          ? { orderId: orderIdOpt }
          : {}),
      });
    } else if (orderIdRaw && eventIdRaw) {
      const oid = parseInt(orderIdRaw, 10);
      const eid = parseInt(eventIdRaw, 10);
      if (isNaN(oid) || isNaN(eid)) {
        return NextResponse.json(
          { code: 400, message: "Invalid orderId or eventId", data: null },
          { status: 400 }
        );
      }
      resolved = await resolveOrderItemForDownloads(userId, {
        orderId: oid,
        eventId: eid,
      });
    } else {
      return NextResponse.json(
        {
          code: 400,
          message: "Provide galleryId or both orderId and eventId",
          data: null,
        },
        { status: 400 }
      );
    }

    if (!resolved || "error" in resolved) {
      return NextResponse.json(
        {
          code: 404,
          message:
            resolved && "error" in resolved && resolved.error === "GALLERY_NOT_FOUND"
              ? "Gallery not found"
              : "Order item not found",
          data: null,
        },
        { status: 404 }
      );
    }

    const item = resolved.orderItem;

    return NextResponse.json({
      code: 200,
      message: "success",
      data: {
        totalnumberOfDownlaod: item.totalnumberOfDownlaod ?? null,
        totalDownlaod: item.totalDownlaod ?? null,
        remainingDownlaod: item.remainingDownlaod ?? null,
      },
    });
  } catch (err) {
    console.error("[item-downloads route]", err);
    return NextResponse.json(
      { code: 500, message: "Server error", data: null },
      { status: 500 }
    );
  }
}
