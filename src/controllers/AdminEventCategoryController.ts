import type { Prisma, EventCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import AdminEventCategoryHook from "@/hooks/AdminEventCategoryHook";
import AdminEventCategoryResource from "@/resources/AdminEventCategoryResource";
import { storeEventCategory, updateEventCategory } from "@/validators/user.validation";
import { generateSlug } from "@/utils/slug";

export type ExtendedEventCategory = EventCategory & { imageUrl?: string };

export default class AdminEventCategoryController extends RestController<
  Prisma.EventCategoryDelegate<DefaultArgs>,
  ExtendedEventCategory
> {
  constructor(req?: Request, data?: Partial<ExtendedEventCategory>) {
    super(
      prisma.eventCategory as unknown as Prisma.EventCategoryDelegate<DefaultArgs> & {
        findMany: (...args: unknown[]) => Promise<unknown>;
        findUnique?: (...args: unknown[]) => Promise<unknown>;
        create?: (...args: unknown[]) => Promise<unknown>;
        update?: (...args: unknown[]) => Promise<unknown>;
        delete?: (...args: unknown[]) => Promise<unknown>;
      },
      req
    );

    this.data = data ?? {};
    this.resource = AdminEventCategoryResource;
    this.hook = AdminEventCategoryHook;
  }

  // ------------------- Validation -------------------
  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeEventCategory, this.data ?? {});
      case "update":
        return await this.__validate(updateEventCategory, this.data ?? {});
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
    if (this.data?.name) {
      this.data.slug = await generateSlug("eventCategory", this.data.name);
    }
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
  }

  protected async afterStore(record: ExtendedEventCategory): Promise<ExtendedEventCategory> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    // const currentUser = this.requireUser();
    // const idParam = this.getRouteParam();
    // const routeId = idParam ? parseInt(idParam.toString(), 10) : 0;
    // if (parseInt(currentUser.id, 10) !== routeId) {
    //   return this.sendError(
    //     "Validation failed",
    //     { authentication: "You can't update another user's address" },
    //     422
    //   );
    // }
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
  }

  protected async afterUpdate(record: ExtendedEventCategory): Promise<ExtendedEventCategory> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}
