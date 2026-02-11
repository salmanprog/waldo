export const runtime = "nodejs";
import UserCoffeeTableBookController from "@/controllers/UserCoffeeTableBookController";
import type { ExtendedCoffeeTableBook } from "@/resources/UserCoffeeTableBookResource";
import { NextResponse } from "next/server";

// ------------------- GET (index) -------------------
export async function GET(req: Request) {
  const controller = new UserCoffeeTableBookController(req);
  return controller.index();
}

// ------------------- POST (store) -------------------
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let data: Partial<ExtendedCoffeeTableBook> = {};
  let formData: FormData | null = null;

  try {
    if (contentType.includes("multipart/form-data")) {
      formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
          (data as Record<string, unknown>)[key] = value;
        }
      }
      // Get images
      const images = formData.getAll("images");
      if (images.length > 0) {
        (data as Record<string, unknown>).images = images;
      }
    } else if (contentType.includes("application/json")) {
      data = await request.json();
    } else {
      return NextResponse.json(
        { code: 415, message: "Unsupported Media Type" },
        { status: 415 }
      );
    }

    const controller = new UserCoffeeTableBookController(request, data);
    return await controller.store(data);
  } catch (error: unknown) {
    console.error("Error creating coffee table book:", error);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
