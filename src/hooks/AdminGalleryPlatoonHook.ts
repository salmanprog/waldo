import { getHookUser } from "@/utils/hookUser";

export default class AdminGalleryPlatoonHook {
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
    if (
      request?.query &&
      typeof request.query === "object" &&
      "galleryId" in request.query
    ) {
      const galleryId = request.query.galleryId;
      if (galleryId) {
        query.where = {
          ...query.where,
          galleryId:
            typeof galleryId === "string"
              ? parseInt(galleryId, 10)
              : Number(galleryId),
        };
      }
    }
    query.orderBy = {
      platoonNumber: "asc",
    };
    return query;
  }

  static async showQueryHook(
    query: any,
    _request?: Record<string, unknown>
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
    return query;
  }

  static async beforeCreateHook(data: any): Promise<any> {
    return data;
  }
}
