import { Prisma, EventCategoryFaq } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";

export default class AdminEventCategoryFaqHook {

  // For listing multiple event category FAQs
  static async indexQueryHook(
    query: Prisma.EventCategoryFaqFindManyArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.EventCategoryFaqFindManyArgs> {
    const user = getHookUser(request);
    query.where = { ...query.where, deletedAt: null };
    if (!user || user.userGroupId !== 1) {
      query.where = { ...query.where, status: true };
    }
    
    // Filter by eventCategoryId if provided in query parameter
    if (request?.query && typeof request.query === 'object' && 'eventCategoryId' in request.query) {
      const eventCategoryId = request.query.eventCategoryId;
      if (eventCategoryId) {
        query.where = { 
          ...query.where, 
          eventCategoryId: typeof eventCategoryId === 'string' ? parseInt(eventCategoryId, 10) : Number(eventCategoryId)
        };
      }
    }
    
    query.orderBy = {
      createdAt: "desc",
    };
    query.include = {
      eventCategory: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    };
    return query;
  }

  // For fetching a single event category FAQ by id
  static async showQueryHook(
    query: Prisma.EventCategoryFaqFindUniqueArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.EventCategoryFaqFindUniqueArgs> {
    query.where = { ...query.where, deletedAt: null };
    query.include = {
      eventCategory: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    };
    return query;
  }

  // Before creating a new event category FAQ
  static async beforeCreateHook(
    data: Prisma.EventCategoryFaqCreateInput
  ): Promise<Prisma.EventCategoryFaqCreateInput> {
    return data;
  }
}

