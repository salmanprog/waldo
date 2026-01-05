export const runtime = "nodejs";
import AdminEventCategoryFaqController, { ExtendedEventCategoryFaq } from "@/controllers/AdminEventCategoryFaqController";
import { NextResponse } from "next/server";

// ------------------- GET (show) -------------------
export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  try {
    const controller = new AdminEventCategoryFaqController(_req);
    const slug = params.slug;
    return await controller.showSlug(String(slug));
  } catch (error: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ------------------- PATCH (update) -------------------
export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  const slug = params.slug;

  const contentType = request.headers.get("content-type") || "";
  let data: Partial<ExtendedEventCategoryFaq> = {};

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

    const controller = new AdminEventCategoryFaqController(request, data);
    return controller.updateBySlug(slug, data);
  } catch (error: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}


// ------------------- DELETE (destroy) -------------------
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  try {
    const slug = params.slug;
    const controller = new AdminEventCategoryFaqController(_req);
    return await controller.destroyBySlug(slug); // <-- use new method
  } catch (error: unknown) {
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

