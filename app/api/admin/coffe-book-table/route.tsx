export const runtime = "nodejs";
import AdminCoffeeTableBookController from "@/controllers/AdminCoffeeTableBookController";
import type { ExtendedCoffeeTableBook } from "@/resources/AdminCoffeeTableBookResource";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";

// ------------------- GET (index) -------------------
export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { code: 401, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { code: 401, message: "Invalid token" },
        { status: 401 }
      );
    }

    const controller = new AdminCoffeeTableBookController(req);
    return controller.index();
  } catch (error: unknown) {
    console.error("Error fetching coffee table books:", error);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ------------------- POST (store) -------------------
export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { code: 401, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { code: 401, message: "Invalid token" },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let data: Partial<ExtendedCoffeeTableBook> = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
          (data as Record<string, unknown>)[key] = value;
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

    const controller = new AdminCoffeeTableBookController(request, data);
    return await controller.store(data);
  } catch (error: unknown) {
    console.error("Error creating coffee table book:", error);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
