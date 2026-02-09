import { Prisma } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";
import { prisma } from "@/lib/prisma";

export default class AdminGalleryHook {

  // For listing multiple blogs
  static async indexQueryHook(
    query: any,
    request?: Record<string, unknown>
  ): Promise<any> {
    const user = getHookUser(request);
    query.where = { ...query.where, deletedAt: null };
    if (!user || user.userGroupId !== 1) {
      query.where = { ...query.where, status: true };
    }
    query.include = {
      eventCategory: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      items: {
        where: {
          deletedAt: null,
          status: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    };
    const q = request?.query && typeof request.query === "object" ? request.query : {};
    if ("eventId" in q && q.eventId) {
      const eventId = typeof q.eventId === "string" ? parseInt(q.eventId, 10) : Number(q.eventId);
      if (!isNaN(eventId)) {
        query.where = { ...query.where, eventId };
      }
    }
    // Filter by platoonNumber from purchased order (for /purchase/[orderId]/gallery)
    if ("orderId" in q && q.orderId && user?.id) {
      const orderId = typeof q.orderId === "string" ? parseInt(q.orderId, 10) : Number(q.orderId);
      if (!isNaN(orderId)) {
        const order = await prisma.order.findFirst({
          where: { id: orderId, userId: Number(user.id), status: "PAID" },
          select: { platoonNumber: true },
        });
        if (order != null) {
          query.where = {
            ...query.where,
            platoons: { some: { platoonNumber: order.platoonNumber } },
          };
        }
      }
    }
    query.orderBy = {
      createdAt: "desc",
    };
    return query;
  }

  // For fetching a single blog by id or slug
  static async showQueryHook(
    query: any,
    request?: Record<string, unknown>
  ): Promise<any> {
    query.include = {
      eventCategory: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      items: {
        where: {
          deletedAt: null,
          status: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    };
    query.where = { ...query.where, deletedAt: null };
    return query;
  }

  // Before creating a new blog
  static async beforeCreateHook(
    data: any
  ): Promise<any> {
    return data;
  }
}

