import { Prisma } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";

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
    if (request?.query && typeof request.query === 'object' && 'eventId' in request.query) {
      const eventId = request.query.eventId;
      if (eventId) {
        query.where = { 
          ...query.where, 
          eventId: typeof eventId === 'string' ? parseInt(eventId, 10) : Number(eventId)
        };
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

