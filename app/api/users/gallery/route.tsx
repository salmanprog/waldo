export const runtime = "nodejs";
import AdminGalleryController from "@/controllers/AdminGalleryController";

export async function GET(req: Request) {
  const controller = new AdminGalleryController(req);
  return controller.index();
}