import { Prisma } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";

export default class AdminBlogCategoryHook {
  static async indexQueryHook(
    query: Prisma.BlogCategoryFindManyArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.BlogCategoryFindManyArgs> {
    const user = getHookUser(request);
    query.where = { ...query.where, deletedAt: null };
    if (!user || user.userGroupId !== 1) {
      query.where = { ...query.where };
    }
    return query;
  }

  static async showQueryHook(
    query: Prisma.BlogCategoryFindUniqueArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.BlogCategoryFindUniqueArgs> {
    query.where = { ...query.where, deletedAt: null };
    return query;
  }

  static async beforeCreateHook(
    data: Prisma.BlogCategoryCreateInput
  ): Promise<Prisma.BlogCategoryCreateInput> {
    return data;
  }
}
