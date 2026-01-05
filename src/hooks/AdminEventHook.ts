import { Prisma, Event } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export default class AdminEventHook {

  static async indexQueryHook(
    query: Prisma.EventFindManyArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.EventFindManyArgs> {
    query.include = {
      category: true,
    };
    query.where = { ...query.where, deletedAt: null, status: true };
    const catId = (request?.query && typeof request.query === 'object' && 'cat_id' in request.query)
      ? request.query.cat_id
      : request?.cat_id;
    if (catId !== undefined && catId !== null && catId !== '') {
      const category = await prisma.eventCategory.findUnique({
        where: { slug: String(catId) },
        select: { id: true },
      });
      query.where = {
        ...query.where,
        categoryId: Number(category?.id),
      };
    }
    
    query.orderBy = {
      createdAt: "desc",
    };
    return query;
  }

  // For fetching a single event category by id or slug
  static async showQueryHook(
    query: Prisma.EventFindUniqueArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.EventFindUniqueArgs> {
    query.include = {
      category: true,
    };
    query.where = { ...query.where, deletedAt: null, status: true };
    return query;
  }

  // Before creating a new event category
  static async beforeCreateHook(
    data: Prisma.EventCreateInput
  ): Promise<Prisma.EventCreateInput> {
    return data;
  }
}
