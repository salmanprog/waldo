import type { OrderItem } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ResolveOrderItemParams =
  | { galleryId: number; orderId?: number }
  | { orderId: number; eventId: number };

export type ResolveOrderItemResult =
  | { orderItem: OrderItem; eventId: number }
  | { error: "GALLERY_NOT_FOUND" | "ORDER_ITEM_NOT_FOUND" };

/**
 * Find the OrderItem line for a PAID order owned by the user (event = purchased product).
 */
export async function resolveOrderItemForDownloads(
  userId: number,
  params: ResolveOrderItemParams
): Promise<ResolveOrderItemResult> {
  let eventId: number;
  let restrictOrderId: number | undefined;

  if ("galleryId" in params) {
    const gallery = await prisma.gallery.findFirst({
      where: { id: params.galleryId, deletedAt: null },
      select: { eventId: true },
    });
    if (!gallery?.eventId) {
      return { error: "GALLERY_NOT_FOUND" };
    }
    eventId = gallery.eventId;
    if (
      params.orderId != null &&
      !Number.isNaN(Number(params.orderId)) &&
      Number(params.orderId) > 0
    ) {
      restrictOrderId = Number(params.orderId);
    }
  } else {
    eventId = params.eventId;
    restrictOrderId = params.orderId;
  }

  const order = await prisma.order.findFirst({
    where: {
      userId,
      status: "PAID",
      ...(restrictOrderId != null ? { id: restrictOrderId } : {}),
      items: { some: { itemId: eventId } },
    },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const orderItem = order?.items.find((i) => i.itemId === eventId) ?? null;
  if (!orderItem) {
    return { error: "ORDER_ITEM_NOT_FOUND" };
  }

  return { orderItem, eventId };
}

/** Parse numeric download counters stored as VarChar; null = not a finite integer string. */
export function parseDownloadCount(
  value: string | null | undefined
): number | null {
  if (value == null) return null;
  const t = String(value).trim();
  if (t === "") return null;
  const n = parseInt(t, 10);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}
