export const runtime = "nodejs";
import AdminGalleryItemsController from "@/controllers/AdminGalleryItemsController";
import type { ExtendedGalleryItems } from "@/resources/AdminGalleryItemsResource";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// ------------------- GET (show) -------------------
export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  try {
    const controller = new AdminGalleryItemsController(_req);
    const slug = params.slug;
    return await controller.showSlug(String(slug));
  } catch (error: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ------------------- DELETE (destroy) -------------------
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  try {
    const slug = params.slug;
    const controller = new AdminGalleryItemsController(_req);
    return await controller.destroyBySlug(slug);
  } catch (error: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

