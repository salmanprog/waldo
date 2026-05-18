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
import {
  deleteGalleryObjectByPublicUrl,
  galleryPublicUrlForKey,
  getGalleryS3PublicBaseUrl,
  isS3GalleryUploadConfigured,
  putGalleryImageToS3,
} from "@/lib/s3GalleryUpload";

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
    if (this.data) {
      if (this.data.platoonNumber !== undefined && this.data.platoonNumber !== null) {
        this.data.platoonNumber = Number(this.data.platoonNumber);
      } else {
        this.data.platoonNumber = 0;
      }
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

      // -------- platoon number (folder name, outside items) ----------
      const rawPlatoonNumber = formData.get("platoonNumber");
      const platoonNumber = rawPlatoonNumber != null && String(rawPlatoonNumber).trim() !== ""
        ? String(rawPlatoonNumber).trim()
        : null;
      // Platoon folder is outside items: galleryPath/platoon-1/ (not galleryPath/items/platoon-1/)
      const uploadSubdir = platoonNumber ? `platoon-${platoonNumber}` : "items";

      const platoonNumberInt = platoonNumber ? parseInt(platoonNumber, 10) : 0;
      const pathForS3Key = gallery.galleryPath.replace(/^\//, "");

      if (!isS3GalleryUploadConfigured()) {
        return this.sendError(
          "S3 is not configured. Set AWS_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.",
          {},
          422
        );
      }
      try {
        getGalleryS3PublicBaseUrl();
      } catch {
        return this.sendError(
          "Set AWS_S3_BUCKET_URL to your bucket base URL (where objects are readable), e.g. https://your-bucket.s3.region.amazonaws.com",
          {},
          422
        );
      }

      const results: {
        originalName: string;
        storedFileName?: string;
        ok: boolean;
        imageUrl?: string;
        error?: string;
      }[] = [];

      // -------- save images (per-file result for batch UI) ----------
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        if (!(file instanceof Blob)) {
          results.push({
            originalName: "unknown",
            ok: false,
            error: "Not a file",
          });
          continue;
        }

        const originalName =
          typeof (file as File).name === "string" && (file as File).name
            ? (file as File).name
            : "image";

        const safeBase = originalName.replace(/[^a-zA-Z0-9._-]+/g, "_");
        const fileName = `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 9)}-${safeBase}`;
        const contentType =
          typeof (file as File).type === "string" && (file as File).type
            ? (file as File).type
            : "application/octet-stream";

        try {
          const buffer = Buffer.from(await file.arrayBuffer());

          const s3Key = `${pathForS3Key}/${uploadSubdir}/${fileName}`;
          await putGalleryImageToS3({
            key: s3Key,
            body: buffer,
            contentType,
          });

          const imageUrl = galleryPublicUrlForKey(s3Key);
          await prisma.galleryItem.create({
            data: {
              galleryId,
              platoonNumber: platoonNumberInt,
              slug: await generateSlug(
                "galleryItem" as any,
                `gallery-item-${Date.now()}-${i}`
              ),
              imageUrl,
              status: true,
            },
          });

          results.push({
            originalName,
            storedFileName: fileName,
            ok: true,
            imageUrl,
          });
        } catch (err) {
          results.push({
            originalName,
            ok: false,
            error: (err as Error).message,
          });
        }
      }

      const succeeded = results.filter((r) => r.ok).length;
      const failed = results.length - succeeded;

      this.resource = null;
      const message =
        failed === 0
          ? "Images uploaded successfully"
          : succeeded === 0
            ? "Upload failed for all images"
            : `Uploaded ${succeeded} of ${results.length} images (${failed} failed)`;

      return this.__sendResponse(200, message, {
        total: results.length,
        succeeded,
        failed,
        results,
        s3: true,
      });
  
    } catch (err) {
      console.error("Multiple upload error:", err);
      return this.sendError((err as Error).message, {}, 500);
    }
  }

  /** Soft-delete row and remove object from S3 when imageUrl is an absolute URL. */
  async destroyBySlug(slug: string): Promise<NextResponse> {
    try {
      const row = await prisma.galleryItem.findFirst({
        where: { slug, deletedAt: null },
        select: { imageUrl: true },
      });
      const beforeResponse = await this.beforeDestroy();
      if (beforeResponse) return beforeResponse;

      await prisma.galleryItem.update({
        where: { slug },
        data: { deletedAt: new Date() },
      });

      if (row?.imageUrl) {
        try {
          await deleteGalleryObjectByPublicUrl(row.imageUrl);
        } catch {
          // ignore missing object
        }
      }

      await this.afterDestroy();
      return this.__sendResponse(200, this.messages.delete, {});
    } catch (err) {
      return this.sendError((err as Error).message, {}, 500);
    }
  }
}

