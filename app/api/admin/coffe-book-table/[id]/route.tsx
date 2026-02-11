export const runtime = "nodejs";
import AdminCoffeeTableBookController from "@/controllers/AdminCoffeeTableBookController";
import type { ExtendedCoffeeTableBook } from "@/resources/AdminCoffeeTableBookResource";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/jwt";

// ------------------- GET (show) -------------------
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const controller = new AdminCoffeeTableBookController(req);
    return controller.show(parseInt(id));
  } catch (error: unknown) {
    console.error("Error fetching coffee table book:", error);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ------------------- PATCH (update) -------------------
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
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
    return await controller.update(parseInt(id), data);
  } catch (error: unknown) {
    console.error("Error updating coffee table book:", error);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ------------------- DELETE (destroy) -------------------
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const controller = new AdminCoffeeTableBookController(req);
    return controller.destroy(parseInt(id));
  } catch (error: unknown) {
    console.error("Error deleting coffee table book:", error);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
