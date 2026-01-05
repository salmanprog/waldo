import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import RestController from "@/core/RestController";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import AdminGalleryItemsHook from "@/hooks/AdminGalleryItemsHook";
import AdminGalleryItemsResource from "@/resources/AdminGalleryItemsResource";
import { storeGalleryItems, updateGalleryItems } from "@/validators/user.validation";
import { generateSlug } from "@/utils/slug";
import type { ExtendedGalleryItems } from "@/resources/AdminGalleryItemsResource";
import path from "path";
import { promises as fs } from "fs";

export default class AdminGalleryController extends RestController<
  any,
  ExtendedGalleryItems
> {
  constructor(req?: Request, data?: Partial<ExtendedGalleryItems>) {
    super(
      (prisma as any).galleryItem as any,
      req
    );

    this.data = data ?? {};
    this.resource = AdminGalleryItemsResource;
    this.hook = AdminGalleryItemsHook;
  }

  // ------------------- Validation -------------------
  protected async validation(action: string) {
    switch (action) {
      case "store":
        return await this.__validate(storeGalleryItems, this.data ?? {});
      case "update":
        return await this.__validate(updateGalleryItems, this.data ?? {});
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
    if (this.data?.galleryId !== undefined && this.data?.galleryId !== null) {
      const gid = Number(this.data.galleryId);
      this.data.galleryId = gid;
    }
    if (this.data) {
      this.data.slug = await generateSlug("galleryItem" as any, "gallery-item-" + Math.floor(Math.random()));
    }
    if (this.data?.sortOrder !== undefined && this.data?.sortOrder !== null) {
      const order = Number(this.data.sortOrder);
      this.data.sortOrder = order;
    }
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
  }

  protected async afterStore(record: ExtendedGalleryItems): Promise<ExtendedGalleryItems> {
    return record;
  }

  protected async beforeUpdate(): Promise<void | NextResponse> {
    if (this.data?.status !== undefined) {
      this.data.status = String(this.data.status) === "1";
    }
  }

  protected async afterUpdate(record: ExtendedGalleryItems): Promise<ExtendedGalleryItems> {
    return record;
  }

  protected async beforeDestroy(): Promise<void | NextResponse> {
    const currentUser = this.requireUser();
    if (!currentUser) {
      return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
    }
  }

  async galleryGroupedList(): Promise<NextResponse> {
    try {
      const galleries = await prisma.gallery.findMany({
        where: {
          deletedAt: null,
          status: true,
        },
        select: {
          id: true,
          title: true,
          _count: {
            select: {
              items: {
                where: {
                  deletedAt: null,
                  status: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
  
      const data = galleries.map(g => ({
        id: g.id,
        title: g.title,
        total_images: g._count.items,
      }));
      this.resource = null;
      return this.__sendResponse(200, "Records fetched successfully", data);
    } catch (err) {
      return this.sendError((err as Error).message, {}, 500);
    }
  }

  async uploadMultipleImages(formData: FormData): Promise<NextResponse> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return this.sendError("Unauthorized", { auth: "User not logged in" }, 401);
      }
  
      // -------- galleryId ----------
      const rawGalleryId = formData.get("galleryId");
      const galleryId = Number(rawGalleryId);
  
      if (!galleryId) {
        return this.sendError("GalleryId missing", {}, 422);
      }
  
      // -------- images ----------
      const images = formData.getAll("images[]") as File[];
  
      if (!images || images.length === 0) {
        return this.sendError("Images missing", {}, 422);
      }
  
      // -------- gallery ----------
      const gallery = await prisma.gallery.findUnique({
        where: { id: galleryId },
        select: { galleryPath: true },
      });
  
      if (!gallery || !gallery.galleryPath) {
        return this.sendError("Gallery not found", {}, 404);
      }
  
      // -------- upload dir ----------
      const relativePath = gallery.galleryPath.replace(/^\/uploads\//, "");
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        relativePath,
        "items"
      );
  
      await fs.mkdir(uploadDir, { recursive: true });
  
      // -------- save images ----------
      for (const file of images) {
        if (!(file instanceof Blob)) continue;
  
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, fileName);
  
        await fs.writeFile(filePath, buffer);
  
        await prisma.galleryItem.create({
          data: {
            galleryId,
            slug: await generateSlug(
              "galleryItem" as any,
              `gallery-item-${Date.now()}`
            ),
            imageUrl: `${gallery.galleryPath}/items/${fileName}`,
            status: true,
          },
        });
      }
      this.resource = null;
      return this.__sendResponse(
        200,
        "Images uploaded successfully",
        { total: images.length }
      );
  
    } catch (err) {
      console.error("Multiple upload error:", err);
      return this.sendError((err as Error).message, {}, 500);
    }
  }
}

