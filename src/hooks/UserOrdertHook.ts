import { Prisma } from "@prisma/client";

export default class UserOrderHook {

  // Modify index (list) query
  static async indexQueryHook(
    query: Prisma.OrderFindManyArgs,
    request?: Record<string, any>
  ): Promise<Prisma.OrderFindManyArgs> {

    // Include relations
    query.include = {
      user: true,
      items: true,
    };

    // Only logged-in user's orders
    if (request?.user?.id) {
      query.where = {
        ...query.where,
        userId: Number(request.user.id),
      };
    }

    // Optional status filter (?status=PAID)
    if (request?.query?.status) {
      query.where = {
        ...query.where,
        status: request.query.status,
      };
    }

    query.orderBy = {
      createdAt: "desc",
    };

    return query;
  }

  // Modify show (single order) query
  static async showQueryHook(
    query: Prisma.OrderFindUniqueArgs,
    request?: Record<string, any>
  ): Promise<Prisma.OrderFindUniqueArgs> {

    query.include = {
      user: true,
      items: true,
    };

    // Extra safety: user can only see their own order
    if (request?.user?.id && query.where?.id) {
      query.where = {
        ...query.where,
        userId: Number(request.user.id),
      };
    }

    return query;
  }

  // Before creating order
  static async beforeCreateHook(
    data: Prisma.OrderCreateInput,
    request?: Record<string, any>
  ): Promise<Prisma.OrderCreateInput> {

    // Attach logged-in user
    if (request?.user?.id) {
      data.user = {
        connect: { id: Number(request.user.id) },
      };
    }

    return data;
  }
}
