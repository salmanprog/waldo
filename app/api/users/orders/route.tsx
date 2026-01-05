export const runtime = "nodejs";
import UserOrderController from "@/controllers/UserOrderController";

export async function GET(req: Request) {
  const controller = new UserOrderController(req);
  return controller.index();
}