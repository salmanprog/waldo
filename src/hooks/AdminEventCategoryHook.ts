import { Prisma, EventCategory } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";

export default class AdminEventCategoryHook {

  // For listing multiple event categories
  static async indexQueryHook(
    query: Prisma.EventCategoryFindManyArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.EventCategoryFindManyArgs> {
    const user = getHookUser(request);
    query.where = { ...query.where, deletedAt: null };
    if (!user || user.userGroupId !== 1) {
      query.where = { ...query.where, status: true };
    }
    // query.orderBy = {
    //   createdAt: "desc",
    // };
    return query;
  }

  // For fetching a single event category by id or slug
  static async showQueryHook(
    query: Prisma.EventCategoryFindUniqueArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.EventCategoryFindUniqueArgs> {
    query.where = { ...query.where, deletedAt: null };
    return query;
  }

  // Before creating a new event category
  static async beforeCreateHook(
    data: Prisma.EventCategoryCreateInput
  ): Promise<Prisma.EventCategoryCreateInput> {
    return data;
  }
}
