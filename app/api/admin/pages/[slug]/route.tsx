export const runtime = "nodejs";
import AdminPagesController from "@/controllers/AdminPagesController";
import type { ExtendedPages } from "@/resources/AdminPagesResource";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  try {
    const controller = new AdminPagesController(_req);
    return await controller.showSlug(String(params.slug));
  } catch (error: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  const slug = params.slug;
  const contentType = request.headers.get("content-type") || "";
  let data: Partial<ExtendedPages> = {};

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
          (data as Record<string, unknown>)[key] = value;
        } else if (value instanceof Blob && key === "image" && value.size > 0) {
          const buffer = Buffer.from(await value.arrayBuffer());
          const uploadDir = path.join(process.cwd(), "public", "uploads", "pages");
          await fs.mkdir(uploadDir, { recursive: true });
          const fileName = `${Date.now()}-${(value as File).name || "upload"}`;
          const filePath = path.join(uploadDir, fileName);
          await fs.writeFile(filePath, buffer);
          (data as Record<string, unknown>).imageUrl = `/uploads/pages/${fileName}`;
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

    const controller = new AdminPagesController(request, data);
    return controller.updateBySlug(slug, data);
  } catch (error: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  try {
    const controller = new AdminPagesController(_req);
    return await controller.destroyBySlug(String(params.slug));
  } catch (error: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
