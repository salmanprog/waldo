import { Prisma } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";

export default class AdminCompanyHook {
  static async indexQueryHook(
    query: Prisma.CompanyFindManyArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.CompanyFindManyArgs> {
    const user = getHookUser(request);
    query.where = { ...query.where, deletedAt: null };
    if (!user || user.userGroupId !== 1) {
      query.where = { ...query.where };
    }
    return query;
  }

  static async showQueryHook(
    query: Prisma.CompanyFindUniqueArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.CompanyFindUniqueArgs> {
    query.where = { ...query.where, deletedAt: null };
    return query;
  }

  static async beforeCreateHook(
    data: Prisma.CompanyCreateInput
  ): Promise<Prisma.CompanyCreateInput> {
    return data;
  }
}
