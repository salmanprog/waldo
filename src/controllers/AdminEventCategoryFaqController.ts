import type { Prisma, EventCategoryFaq } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import AdminEventCategoryFaqHook from "@/hooks/AdminEventCategoryFaqHook";
import AdminEventCategoryFaqResource from "@/resources/AdminEventCategoryFaqResource";
import { storeEventCategoryFaq, updateEventCategoryFaq } from "@/validators/user.validation";
import { generateSlug } from "@/utils/slug";

export type ExtendedEventCategoryFaq = EventCategoryFaq;

export default class AdminEventCategoryFaqController extends RestController<
  Prisma.EventCategoryFaqDelegate<DefaultArgs>,
  ExtendedEventCategoryFaq
> {
  constructor(req?: Request, data?: Partial<ExtendedEventCategoryFaq>) {
    super(
      prisma.eventCategoryFaq as unknown as Prisma.EventCategoryFaqDelegate<DefaultArgs> & {
        findMany: (...args: unknown[]) => Promise<unknown>;
        findUnique?: (...args: unknown[]) => Promise<unknown>;
        create?: (...args: unknown[]) => Promise<unknown>;
        update?: (...args: unknown[]) => Promise<unknown>;
        delete?: (...args: unknown[]) => Promise<unknown>;
      },
      req
    );

    this.data = data ?? {};
    this.resource = AdminEventCategoryFaqResource;
    this.hook = AdminEventCategoryFaqHook;
  }

  // ------------------- Validation -------------------
  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeEventCategoryFaq, this.data ?? {});
      case "update":
        return await this.__validate(updateEventCategoryFaq, this.data ?? {});
    }
  }

  // ------------------- Hooks -------------------
  protected async beforeIndex(): Promise<void | NextResponse> {
    this.getCurrentUser(); // can log if needed
  }

  protected async beforeShow(): Promise<void | NextResponse> {
    // Add any authorization checks if needed
  }

  protected async beforeStore(): Promise<void | NextResponse> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
    if (this.data?.question) {
      this.data.slug = await generateSlug("eventCategoryFaq", this.data.question);
    }
    if (this.data?.eventCategoryId !== undefined) {
      this.data.eventCategoryId = Number(this.data.eventCategoryId);
    }
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
  }

  protected async afterStore(record: ExtendedEventCategoryFaq): Promise<ExtendedEventCategoryFaq> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
    if (this.data?.eventCategoryId !== undefined) {
      this.data.eventCategoryId = Number(this.data.eventCategoryId);
    }
  }

  protected async afterUpdate(record: ExtendedEventCategoryFaq): Promise<ExtendedEventCategoryFaq> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}

