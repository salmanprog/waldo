import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import { NextResponse } from "next/server";
import AdminGalleryPlatoonHook from "@/hooks/AdminGalleryPlatoonHook";
import AdminGalleryPlatoonResource from "@/resources/AdminGalleryPlatoonResource";
import type { ExtendedGalleryPlatoon } from "@/resources/AdminGalleryPlatoonResource";

export default class AdminGalleryPlatoonController extends RestController<
  any,
  ExtendedGalleryPlatoon
> {
  constructor(req?: Request, data?: Partial<ExtendedGalleryPlatoon>) {
    super((prisma as any).galleryPlatoon as any, req);

    this.data = data ?? {};
    this.resource = AdminGalleryPlatoonResource;
    this.hook = AdminGalleryPlatoonHook;
  }

  // ------------------- Hooks -------------------
  protected async beforeIndex(): Promise<void | NextResponse> {
    this.getCurrentUser();
  }

  protected async beforeShow(): Promise<void | NextResponse> {
    // Optional: Add authorization checks here
  }

  protected async beforeStore(): Promise<void | NextResponse> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
    if (this.data?.galleryId !== undefined && this.data?.galleryId !== null) {
      this.data.galleryId = Number(this.data.galleryId);
    }
    if (this.data?.platoonNumber !== undefined && this.data?.platoonNumber !== null) {
      this.data.platoonNumber = Number(this.data.platoonNumber);
    }
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    if (this.data?.galleryId !== undefined && this.data?.galleryId !== null) {
      this.data.galleryId = Number(this.data.galleryId);
    }
    if (this.data?.platoonNumber !== undefined && this.data?.platoonNumber !== null) {
      this.data.platoonNumber = Number(this.data.platoonNumber);
    }
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }

  async destroy(id: number): Promise<NextResponse> {
    try {
      await this.beforeDestroy();
      await (this.model as any).delete({ where: { id } });
      await this.afterDestroy();
      return this.__sendResponse(200, this.messages.delete, {});
    } catch (err) {
      return this.sendError((err as Error).message, {}, 500);
    }
  }
}
