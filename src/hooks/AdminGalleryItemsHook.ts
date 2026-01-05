import { Prisma } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";

export default class AdminGalleryItemsHook {

  // For listing multiple blogs
  static async indexQueryHook(
    query: any,
    request?: Record<string, unknown>
  ): Promise<any> {
    const user = getHookUser(request);
    query.include = {
      gallery: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    };
    if (request?.query && typeof request.query === 'object' && 'galleryId' in request.query) {
      const galleryId = request.query.galleryId;
      if (galleryId) {
        query.where = { 
          ...query.where, 
          galleryId: typeof galleryId === 'string' ? parseInt(galleryId, 10) : Number(galleryId)
        };
      }
    }
    query.where = { ...query.where, deletedAt: null };
    if (!user || user.userGroupId !== 1) {
      query.where = { ...query.where, status: true };
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
      gallery: {
        select: {
          id: true,
          title: true,
          slug: true,
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

