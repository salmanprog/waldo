import type { Prisma, Order } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import UserOrdertHook from "@/hooks/UserOrdertHook";
import UserOrderResource from "@/resources/UserOrderResource";
import { storeOrder, updateOrder } from "@/validators/user.validation";
import { generateSlug } from "@/utils/slug";

export type ExtendedOrder = Order & {
  userName?: string;
};

export default class UserOrderController extends RestController<
  Prisma.OrderDelegate<DefaultArgs>,
  ExtendedOrder
> {
  constructor(req?: Request, data?: Partial<ExtendedOrder>) {
    super(
      prisma.order as unknown as Prisma.OrderDelegate<DefaultArgs> & {
        findMany: (...args: unknown[]) => Promise<unknown>;
        findUnique?: (...args: unknown[]) => Promise<unknown>;
        create?: (...args: unknown[]) => Promise<unknown>;
        update?: (...args: unknown[]) => Promise<unknown>;
        delete?: (...args: unknown[]) => Promise<unknown>;
      },
      req
    );

    this.data = data ?? {};
    this.resource = UserOrderResource;
    this.hook = UserOrdertHook;
  }

  // ------------------- Validation -------------------
  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeOrder, this.data ?? {});
      case "update":
        return await this.__validate(updateOrder, this.data ?? {});
    }
  }

  // ------------------- Hooks -------------------
  protected async beforeIndex(): Promise<void | NextResponse> {
    this.getCurrentUser(); // can log if needed
  }

  protected async beforeShow(): Promise<void | NextResponse> {
    // const user = this.requireUser();
    // const id = this.getRouteParam() ?? "";
    // if (parseInt(user.id) !== parseInt(id)) {
    //   return this.sendError(
    //     "Validation failed",
    //     { authentication: "You can't view another user's address" },
    //     422
    //   );
    // }
  }

  protected async beforeStore(): Promise<void | NextResponse> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }

  protected async afterStore(record: ExtendedOrder): Promise<ExtendedOrder> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    
  }

  protected async afterUpdate(record: ExtendedOrder): Promise<ExtendedOrder> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}
