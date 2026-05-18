export const runtime = "nodejs";

import { NextResponse } from "next/server";
import AdminGalleryItemsController from "@/controllers/AdminGalleryItemsController";

export async function POST(req: Request) {
  const formData = await req.formData(); // ✅ body read ONCE
  const controller = new AdminGalleryItemsController(req);
  return controller.uploadMultipleImages(formData);
}