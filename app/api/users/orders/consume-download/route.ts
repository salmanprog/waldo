export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/jwt";
import {
  parseDownloadCount,
  resolveOrderItemForDownloads,
} from "@/lib/orderDownload";

/**
 * Atomically consume one download for the OrderItem tied to this gallery's event.
 */
export async function POST(req: Request) {
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

    const body = (await req.json().catch(() => null)) as {
      galleryId?: number;
      orderId?: number;
    } | null;
    const galleryId = body?.galleryId != null ? Number(body.galleryId) : NaN;
    if (Number.isNaN(galleryId) || galleryId < 1) {
      return NextResponse.json(
        { code: 400, message: "galleryId required", data: null },
        { status: 400 }
      );
    }

    const userId = parseInt(decoded.id, 10);
    const orderIdOpt =
      body?.orderId != null && !Number.isNaN(Number(body.orderId))
        ? Number(body.orderId)
        : undefined;

    const resolved = await resolveOrderItemForDownloads(userId, {
      galleryId,
      ...(orderIdOpt != null ? { orderId: orderIdOpt } : {}),
    });

    if ("error" in resolved) {
      return NextResponse.json(
        {
          code: 404,
          message:
            resolved.error === "GALLERY_NOT_FOUND"
              ? "Gallery not found"
              : "No purchase found for this gallery",
          data: null,
        },
        { status: 404 }
      );
    }

    const { orderItem } = resolved;
    const remaining = parseDownloadCount(orderItem.remainingDownlaod);
    const used = parseDownloadCount(orderItem.totalDownlaod) ?? 0;

    if (remaining !== null && remaining <= 0) {
      return NextResponse.json(
        {
          code: 403,
          message: "Your download limit is exceeded.",
          data: null,
        },
        { status: 403 }
      );
    }

    if (remaining !== null) {
      await prisma.orderItem.update({
        where: { id: orderItem.id },
        data: {
          totalDownlaod: String(used + 1),
          remainingDownlaod: String(remaining - 1),
        },
      });
      return NextResponse.json({
        code: 200,
        message: "success",
        data: {
          totalDownlaod: String(used + 1),
          remainingDownlaod: String(remaining - 1),
        },
      });
    }

    // Non-numeric remaining (e.g. unlimited text): allow download without mutating counters
    return NextResponse.json({
      code: 200,
      message: "success",
      data: {
        totalDownlaod: orderItem.totalDownlaod,
        remainingDownlaod: orderItem.remainingDownlaod,
        untracked: true,
      },
    });
  } catch (err) {
    console.error("[consume-download route]", err);
    return NextResponse.json(
      { code: 500, message: "Server error", data: null },
      { status: 500 }
    );
  }
}
