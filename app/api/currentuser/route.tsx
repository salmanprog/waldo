import UsersController from "@/controllers/UsersController";
import { verifyToken } from "@/utils/jwt";
import { getUserByToken } from "@/utils/token";

export const runtime = "nodejs"; // required for JWT verification

interface DecodedToken {
  id: string;
  [key: string]: unknown;
}

// Helper: valid JWT + token row in DB + active user (matches getUserByToken)
async function getUserFromRequest(req: Request): Promise<DecodedToken | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1]; // Correct index
  if (!token) return null;

  const decoded = await verifyToken(token);
  if (!decoded || typeof decoded === "string") return null;

  const sessionUser = await getUserByToken(token);
  if (!sessionUser) return null;

  const payloadId = (decoded as { id?: unknown }).id;
  if (payloadId === undefined || payloadId === null) return null;
  if (String(sessionUser.id) !== String(payloadId)) return null;

  return { id: String(sessionUser.id) };
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return new Response(
        JSON.stringify({
          code: 401,
          message: "Authorization failed",
          data: { authorization: "Missing or invalid token" },
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const controller = new UsersController(req);
    const id = parseInt(user.id, 10);
    return await controller.show(id);
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        code: 500,
        message: err?.message || "Server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
