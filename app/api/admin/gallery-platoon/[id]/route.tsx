export const runtime = "nodejs";

import AdminGalleryPlatoonController from "@/controllers/AdminGalleryPlatoonController";
import type { ExtendedGalleryPlatoon } from "@/resources/AdminGalleryPlatoonResource";
import { NextResponse } from "next/server";

// ------------------- GET (show) -------------------
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const controller = new AdminGalleryPlatoonController(_req);
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { code: 400, message: "Invalid ID" },
        { status: 400 }
      );
    }
    return await controller.show(id);
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

// ------------------- PATCH (update) -------------------
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ code: 400, message: "Invalid ID" }, { status: 400 });
  }

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
        { code: 415, message: "Unsupported Media Type. Use JSON or form-data." },
        { status: 415 }
      );
    }

    const controller = new AdminGalleryPlatoonController(request, data);
    return await controller.update(id, data);
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

// ------------------- DELETE (destroy) -------------------
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ code: 400, message: "Invalid ID" }, { status: 400 });
    }
    const controller = new AdminGalleryPlatoonController(_req);
    return await controller.destroy(id);
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
