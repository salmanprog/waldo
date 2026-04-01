import { Prisma } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";

export default class AdminPagesHook {
  static async indexQueryHook(
    query: Prisma.PagesFindManyArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.PagesFindManyArgs> {
    const user = getHookUser(request);
    query.where = { ...query.where, deletedAt: null };
    if (!user || user.userGroupId !== 1) {
      query.where = { ...query.where, status: true };
    }
    query.orderBy = { createdAt: "desc" };
    return query;
  }

  static async showQueryHook(
    query: Prisma.PagesFindUniqueArgs,
    _request?: Record<string, unknown>
  ): Promise<Prisma.PagesFindUniqueArgs> {
    query.where = { ...query.where, deletedAt: null };
    return query;
  }

  static async beforeCreateHook(
    data: Prisma.PagesCreateInput
  ): Promise<Prisma.PagesCreateInput> {
    return data;
  }
}
