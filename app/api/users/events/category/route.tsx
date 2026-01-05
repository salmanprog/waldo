export const runtime = "nodejs";
import AdminEventCategoryController from "@/controllers/AdminEventCategoryController";

export async function GET(req: Request) {
  const controller = new AdminEventCategoryController(req);
  return controller.index();
}