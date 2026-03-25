export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";
import { notifyPurchasersOfGalleryImageUpload } from "@/lib/galleryUploadPurchaserMail";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { code: 401, message: "Authorization failed" },
        { status: 401 }
      );
    }
    const decoded = await verifyToken(token);
    if (!decoded || typeof decoded === "string") {
      return NextResponse.json(
        { code: 401, message: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null) as { galleryId?: number } | null;
    const galleryId = body?.galleryId != null ? Number(body.galleryId) : NaN;
    if (Number.isNaN(galleryId) || galleryId < 1) {
      return NextResponse.json(
        { code: 422, message: "galleryId is required" },
        { status: 422 }
      );
    }

    const result = await notifyPurchasersOfGalleryImageUpload(galleryId);

    return NextResponse.json({
      code: 200,
      message: "Notification run completed",
      data: result,
    });
  } catch (err) {
    console.error("[notify-purchasers]", err);
    return NextResponse.json(
      { code: 500, message: (err as Error).message },
      { status: 500 }
    );
  }
}
