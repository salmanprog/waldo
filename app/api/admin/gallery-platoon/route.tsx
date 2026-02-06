export const runtime = "nodejs";

import AdminGalleryPlatoonController from "@/controllers/AdminGalleryPlatoonController";
import type { ExtendedGalleryPlatoon } from "@/resources/AdminGalleryPlatoonResource";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";

interface DecodedToken {
  id: string;
  [key: string]: unknown;
}

// ------------------- POST (store) -------------------
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let data: Partial<ExtendedGalleryPlatoon> = {};

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
          (data as Record<string, any>)[key] = value;
        }
      }
    } else if (contentType.includes("application/json")) {
      data = await request.json();
    } else {
      return NextResponse.json(
        { code: 415, message: "Unsupported Media Type" },
        { status: 415 }
      );
    }

    const controller = new AdminGalleryPlatoonController(request, data);
    return await controller.store(data);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        code: 500,
        message: "Internal Server Error",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// ------------------- GET (list all) -------------------
async function getUserFromRequest(req: Request): Promise<DecodedToken | null> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return null;

    const token = authHeader.split(" ")[1]; // Bearer token
    const decoded = await verifyToken(token);

    if (!decoded || typeof decoded === "string") return null;
    return decoded as DecodedToken;
  } catch (err) {
    return null;
  }
}

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json(
      {
        code: 401,
        message: "Authorization failed",
        data: { authorization: "Missing or invalid token" },
      },
      { status: 401 }
    );
  }

  const controller = new AdminGalleryPlatoonController(req, {
    id: Number(user.id),
  });
  return controller.index();
}
