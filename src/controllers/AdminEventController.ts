import type { Prisma, Event } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import AdminEventHook from "@/hooks/AdminEventHook";
import AdminEventResource from "@/resources/AdminEventResource";
import { storeEvent, updateEvent } from "@/validators/user.validation";
import { generateSlug } from "@/utils/slug";

export type ExtendedEvent = Event & { imageUrl?: string; is_face?: boolean; is_manual?: boolean; };

export default class AdminEventController extends RestController<
  Prisma.EventDelegate<DefaultArgs>,
  ExtendedEvent
> {
  constructor(req?: Request, data?: Partial<ExtendedEvent>) {
    super(
      prisma.event as unknown as Prisma.EventDelegate<DefaultArgs> & {
        findMany: (...args: unknown[]) => Promise<unknown>;
        findUnique?: (...args: unknown[]) => Promise<unknown>;
        create?: (...args: unknown[]) => Promise<unknown>;
        update?: (...args: unknown[]) => Promise<unknown>;
        delete?: (...args: unknown[]) => Promise<unknown>;
      },
      req
    );

    this.data = data ?? {};
    this.resource = AdminEventResource;
    this.hook = AdminEventHook;
  }

  // ------------------- Validation -------------------
  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeEvent, this.data ?? {});
      case "update":
        return await this.__validate(updateEvent, this.data ?? {});
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
    if (this.data?.title) {
      this.data.slug = await generateSlug("event", this.data.title);
    }
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
    if (this.data?.categoryId !== undefined) {
      this.data.categoryId = Number(this.data.categoryId);
    }
    if (this.data?.price !== undefined) {
      this.data.price = Number(this.data.price);
    }
    if (this.data?.is_face !== undefined) {
      this.data.is_face = String(this.data.is_face) === "1";
    }
    if (this.data?.is_manual !== undefined) {
      this.data.is_manual = String(this.data.is_manual) === "1";
    }
  }

  protected async afterStore(record: ExtendedEvent): Promise<ExtendedEvent> {
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
    if (this.data?.categoryId !== undefined) {
      this.data.categoryId = Number(this.data.categoryId);
    }
    if (this.data?.price !== undefined) {
      this.data.price = Number(this.data.price);
    }
    if (this.data?.is_face !== undefined) {
      this.data.is_face = String(this.data.is_face) === "1";
    }
    if (this.data?.is_manual !== undefined) {
      this.data.is_manual = String(this.data.is_manual) === "1";
    }
  }

  protected async afterUpdate(record: ExtendedEvent): Promise<ExtendedEvent> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}
