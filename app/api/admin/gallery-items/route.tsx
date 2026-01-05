export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import AdminGalleryItemsController from "@/controllers/AdminGalleryItemsController";
import type { ExtendedGalleryItems } from "@/resources/AdminGalleryItemsResource";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { verifyToken } from "@/utils/jwt";
import path from "path";
interface DecodedToken {
  id: string;
  [key: string]: unknown;
}
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let data: Partial<ExtendedGalleryItems> = {};

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const rawGalleryId = formData.get("galleryId");
      const galleryId = Number(rawGalleryId);
      const gallery = await prisma.gallery.findUnique({
        where: { id: galleryId },
        select: { id: true, galleryPath: true },
      });

      if (!gallery || !gallery.galleryPath) {
        return NextResponse.json(
          { code: 404, message: "Gallery not found" },
          { status: 404 }
        );
      }
      
      const relativePath = gallery.galleryPath.replace(/^\/uploads\//, "");
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        relativePath,
        "items"
      );

      await fs.mkdir(uploadDir, { recursive: true });
      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
          (data as Record<string, any>)[key] = value;
        } 
        else if (value instanceof Blob && key === "image") {
          const file = value as File;

          const buffer = Buffer.from(await file.arrayBuffer());
          const fileName = `${Date.now()}-${file.name || "upload"}`;
          const filePath = path.join(uploadDir, fileName);

          await fs.writeFile(filePath, buffer);
          (data as Record<string, any>).imageUrl =
            `${gallery.galleryPath}/items/${fileName}`;
        }
      }

      // ensure galleryId is numeric
      data.galleryId = galleryId;

    } else if (contentType.includes("application/json")) {
      data = await request.json();
    } else {
      return NextResponse.json(
        { code: 415, message: "Unsupported Media Type" },
        { status: 415 }
      );
    }

    const controller = new AdminGalleryItemsController(request, data);
    return await controller.store(data);

  } catch (error: unknown) {
    console.error("Error uploading gallery item:", error);
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
// ------------------- GET (list all gallery) -------------------
async function getUserFromRequest(req: Request): Promise<DecodedToken | null> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return null;
    
    const token = authHeader.split(" ")[1]; // Bearer token
    const decoded = await verifyToken(token);

    if (!decoded || typeof decoded === "string") return null; // invalid token
    return decoded as DecodedToken;
  } catch (err) {
    return null; // catch any verify error
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

  const controller = new AdminGalleryItemsController(req, { id: Number(user.id) });
  return controller.index();
}