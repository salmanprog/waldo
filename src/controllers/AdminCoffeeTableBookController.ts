import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import AdminCoffeeTableBookHook from "@/hooks/AdminCoffeeTableBookHook";
import AdminCoffeeTableBookResource from "@/resources/AdminCoffeeTableBookResource";
import { storeCoffeeTableBook, updateCoffeeTableBook } from "@/validators/coffeeTableBook.validation";
import { generateSlug } from "@/utils/slug";
import type { ExtendedCoffeeTableBook } from "@/resources/AdminCoffeeTableBookResource";

export default class AdminCoffeeTableBookController extends RestController<
  any,
  ExtendedCoffeeTableBook
> {
  constructor(req?: Request, data?: Partial<ExtendedCoffeeTableBook>) {
    super(
      (prisma as any).coffeeTableBook as any,
      req
    );

    this.data = data ?? {};
    this.resource = AdminCoffeeTableBookResource;
    this.hook = AdminCoffeeTableBookHook;
  }

  // ------------------- Validation -------------------
  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeCoffeeTableBook, this.data ?? {});
      case "update":
        return await this.__validate(updateCoffeeTableBook, this.data ?? {});
    }
  }

  // ------------------- Hooks -------------------
  protected async beforeIndex(): Promise<void | NextResponse> {
    this.getCurrentUser();
  }

  protected async beforeShow(): Promise<void | NextResponse> {
    // Optional
  }

  protected async beforeStore(): Promise<void | NextResponse> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
    const d = this.data as Record<string, unknown> | null;
    if (d && !d.slug) {
      const base = `${d.firstName ?? ""}-${d.lastName ?? ""}-${Date.now()}`;
      d.slug = await generateSlug("coffeeTableBook" as any, base);
    }
  }

  protected async afterStore(record: ExtendedCoffeeTableBook): Promise<ExtendedCoffeeTableBook> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    // Optional
  }

  protected async afterUpdate(record: ExtendedCoffeeTableBook): Promise<ExtendedCoffeeTableBook> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }

  // Override destroy to perform hard delete
  async destroy(id: number): Promise<NextResponse> {
    try {
      const beforeResponse = await this.beforeDestroy();
      if (beforeResponse) return beforeResponse;

      await (this.model as any).delete({
        where: { id },
      });

      return this.__sendResponse(200, "Record deleted successfully", {});
    } catch (error) {
      console.error("Delete error:", error);
      return this.sendError("Failed to delete record", {}, 500);
    }
  }
}
