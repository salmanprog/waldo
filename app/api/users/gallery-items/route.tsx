export const runtime = "nodejs";
import AdminGalleryItemsController from "@/controllers/AdminGalleryItemsController";

export async function GET(req: Request) {
  const controller = new AdminGalleryItemsController(req);
  return controller.index();
}