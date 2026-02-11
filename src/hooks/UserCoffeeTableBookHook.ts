import { Prisma } from "@prisma/client";

export default class UserCoffeeTableBookHook {
  static async indexQueryHook(
    query: Prisma.CoffeeTableBookFindManyArgs,
    _request?: Record<string, unknown>
  ): Promise<Prisma.CoffeeTableBookFindManyArgs> {
    (query as any).include = { images: true };
    (query as any).orderBy = { createdAt: "desc" };
    return query;
  }

  static async showQueryHook(
    query: Prisma.CoffeeTableBookFindUniqueArgs,
    _request?: Record<string, unknown>
  ): Promise<Prisma.CoffeeTableBookFindUniqueArgs> {
    (query as any).include = { images: true };
    return query;
  }
}
