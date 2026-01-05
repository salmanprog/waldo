export const runtime = "nodejs";
import AdminEventCategoryFaqController from "@/controllers/AdminEventCategoryFaqController";

export async function GET(req: Request) {
  const controller = new AdminEventCategoryFaqController(req);
  return controller.index();
}

