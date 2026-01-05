export const runtime = "nodejs";
import AdminEventController from "@/controllers/AdminEventController";

export async function GET(req: Request) {
  const controller = new AdminEventController(req);
  return controller.index();
}