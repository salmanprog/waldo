import { Prisma, UserType } from "@prisma/client";
import { getHookUser } from "@/utils/hookUser";

export default class AdminUserHook {

  static async indexQueryHook(
    query: Prisma.UserFindManyArgs,
    request?: Record<string, unknown>
  ): Promise<Prisma.UserFindManyArgs> {
    const user = getHookUser(request);
    query.include = {
      userRole: true,
      apiTokens: true,
    };
    query.where = { ...query.where, deletedAt: null,userGroupId: 2 };
    if (user && user.id) {
      query.where = { ...query.where, id: { not: Number(user.id) } };
    }
    const q = request?.query && typeof request.query === "object" ? (request.query as Record<string, unknown>).q : request?.q;
    if (typeof q === "string" && q.trim()) {
      query.where = {
        ...query.where,
        OR: [
          { name: { contains: q.trim() } },
          { lname: { contains: q.trim() } },
          { email: { contains: q.trim() } },
        ],
      };
    }

    if (request && typeof request.userType === "string") {
        query.where = {
            ...query.where,
            userType: request.userType as UserType,
        };
    }
    return query;
  }

  static async showQueryHook(
  query: Prisma.UserFindUniqueArgs,
  request?: Record<string, unknown>
  ): Promise<Prisma.UserFindUniqueArgs> {
    query.include = {
      userRole: true,
      apiTokens: true,
    };
    query.where = { ...query.where, deletedAt: null,userGroupId: 2 };

    return query;
  }

  static async beforeCreateHook(
  data: Prisma.UserCreateInput & { userGroupId?: number }
): Promise<Prisma.UserCreateInput & { userGroupId?: number }> { 
   data.userGroupId = 2;
    return data;
  }
}
