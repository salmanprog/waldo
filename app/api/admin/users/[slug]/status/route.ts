export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/jwt";
import AdminUserResource from "@/resources/AdminUserResource";

interface DecodedToken {
  id: string;
  [key: string]: unknown;
}

async function getBearerToken(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  return authHeader.split(" ")[1] || null;
}

export async function PATCH(req: Request, context: { params: Promise<{ slug: string }> }) {
  const params = await context.params;
  const slug = decodeURIComponent(params.slug || "").trim();
  if (!slug) {
    return NextResponse.json({ code: 400, message: "User slug is required" }, { status: 400 });
  }

  const token = await getBearerToken(req);
  if (!token) {
    return NextResponse.json({ code: 401, message: "Authorization required" }, { status: 401 });
  }

  const decoded = await verifyToken(token);
  if (!decoded || typeof decoded === "string") {
    return NextResponse.json({ code: 401, message: "Invalid token" }, { status: 401 });
  }

  const adminId = parseInt(String((decoded as DecodedToken).id), 10);
  const admin = await prisma.user.findFirst({
    where: { id: adminId, deletedAt: null },
    include: { userRole: true },
  });

  const isAdmin =
    admin?.userType === "ADMIN" ||
    admin?.userRole?.type === "ADMIN" ||
    admin?.userRole?.slug === "admin";

  if (!admin || !isAdmin) {
    return NextResponse.json({ code: 403, message: "Forbidden" }, { status: 403 });
  }

  let body: { status?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ code: 400, message: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.status !== "boolean") {
    return NextResponse.json({ code: 422, message: "Field `status` (boolean) is required" }, { status: 422 });
  }

  const endUserRole = await prisma.userRole.findUnique({ where: { slug: "user" } });
  if (!endUserRole) {
    return NextResponse.json({ code: 500, message: "User role not configured" }, { status: 500 });
  }

  const target = await prisma.user.findFirst({
    where: { slug, deletedAt: null, userGroupId: endUserRole.id },
    include: { userRole: true, apiTokens: true },
  });

  if (!target) {
    return NextResponse.json({ code: 404, message: "User not found" }, { status: 404 });
  }

  if (target.id === adminId) {
    return NextResponse.json({ code: 422, message: "You cannot deactivate your own admin account from this action" }, { status: 422 });
  }

  await prisma.user.update({
    where: { id: target.id },
    data: { status: body.status },
  });

  if (body.status === false) {
    await prisma.userApiToken.deleteMany({ where: { userId: target.id } });
  }

  const updated = await prisma.user.findFirst({
    where: { id: target.id },
    include: { userRole: true, apiTokens: true },
  });

  if (!updated) {
    return NextResponse.json({ code: 500, message: "Failed to load updated user" }, { status: 500 });
  }

  const resource = new AdminUserResource();
  const data = await resource.toArray(updated);

  return NextResponse.json({ code: 200, message: "User status updated", data }, { status: 200 });
}
