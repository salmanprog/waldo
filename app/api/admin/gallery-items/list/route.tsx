import { NextResponse } from "next/server";
import AdminGalleryItemsController from "@/controllers/AdminGalleryItemsController";

export async function GET(req: Request) {
  const controller = new AdminGalleryItemsController(req);
  return controller.galleryGroupedList();
}