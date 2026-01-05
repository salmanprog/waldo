import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import AdminGalleryHook from "@/hooks/AdminGalleryHook";
import AdminGalleryResource from "@/resources/AdminGalleryResource";
import { storeGallery, updateGallery } from "@/validators/user.validation";
import { generateSlug } from "@/utils/slug";
import type { ExtendedGallery } from "@/resources/AdminGalleryResource";

export default class AdminGalleryController extends RestController<
  any,
  ExtendedGallery
> {
  constructor(req?: Request, data?: Partial<ExtendedGallery>) {
    super(
      (prisma as any).gallery as any,
      req
    );

    this.data = data ?? {};
    this.resource = AdminGalleryResource;
    this.hook = AdminGalleryHook;
  }

  // ------------------- Validation -------------------
  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeGallery, this.data ?? {});
      case "update":
        return await this.__validate(updateGallery, this.data ?? {});
    }
  }

  // ------------------- Hooks -------------------
  protected async beforeIndex(): Promise<void | NextResponse> {
    this.getCurrentUser(); // can log if needed
  }

  protected async beforeShow(): Promise<void | NextResponse> {
    // Optional: Add authorization checks here
  }

  protected async beforeStore(): Promise<void | NextResponse> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
    if (this.data?.title) {
      this.data.slug = await generateSlug("gallery" as any, this.data.title);
    }
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }

    if (this.data?.eventCategoryId !== undefined && this.data?.eventCategoryId !== null) {
      this.data.eventCategoryId = Number(this.data.eventCategoryId);
    }
  
    if (this.data?.eventId !== undefined && this.data?.eventId !== null) {
      this.data.eventId = Number(this.data.eventId);
    }
  }

  protected async afterStore(record: ExtendedGallery): Promise<ExtendedGallery> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
    if (this.data?.eventCategoryId !== undefined && this.data?.eventCategoryId !== null) {
      this.data.eventCategoryId = Number(this.data.eventCategoryId);
    }
  
    if (this.data?.eventId !== undefined && this.data?.eventId !== null) {
      this.data.eventId = Number(this.data.eventId);
    }
  }

  protected async afterUpdate(record: ExtendedGallery): Promise<ExtendedGallery> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }
}

