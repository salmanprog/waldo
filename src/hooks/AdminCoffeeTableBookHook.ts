import type { Prisma } from "@prisma/client";

export default class AdminCoffeeTableBookHook {
  static async indexQueryHook(
    query: any,
    request?: Record<string, unknown>
  ): Promise<any> {
    query.include = {
      images: true,
    };
    query.orderBy = {
      createdAt: "desc",
    };
    return query;
  }

  static async showQueryHook(
    query: any,
    request?: Record<string, unknown>
  ): Promise<any> {
    query.include = {
      images: true,
    };
    return query;
  }

  static async beforeCreateHook(data: any): Promise<any> {
    return data;
  }
}
