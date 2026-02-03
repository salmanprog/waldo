export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/jwt";
import { getUserByToken } from "@/utils/token";
import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { promises as fs } from "fs";

async function getAuthUser(req: Request): Promise<{ id: number; userGroupId?: number } | null> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    if (!token) return null;
    const user = await getUserByToken(token);
    if (!user) return null;
    return { id: user.id, userGroupId: user.userGroupId ?? undefined };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { code: 401, message: "Authorization failed" },
      { status: 401 }
    );
  }
  if (user.userGroupId !== 1) {
    return NextResponse.json(
      { code: 403, message: "Forbidden" },
      { status: 403 }
    );
  }

  let galleryId: number | null = null;
  let fullRebuild = false;
  try {
    const body = await request.json().catch(() => ({}));
    galleryId = body.galleryId != null ? Number(body.galleryId) : null;
    fullRebuild = Boolean(body.fullRebuild);
  } catch {
    // no body
  }

  let galleryFolder: string | null = null;
  if (galleryId) {
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      select: { galleryPath: true },
    });
    if (!gallery?.galleryPath) {
      return NextResponse.json(
        { code: 404, message: "Gallery not found" },
        { status: 404 }
      );
    }
    // galleryPath is e.g. /uploads/gallery/photographs-of-graduations-commissioning-gallery
    galleryFolder = gallery.galleryPath.replace(/^\/uploads\/gallery\/?/, "").split("/")[0] || null;
  }

  const scriptPath = path.join(process.cwd(), "scripts", "build-face-index.js");
  const args = galleryFolder ? [`--gallery=${galleryFolder}`] : [];
  const env = { ...process.env, ...(fullRebuild ? { FACE_INDEX_FULL: "1" } : {}) };

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (data: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      const child = spawn("node", [scriptPath, ...args], {
        cwd: process.cwd(),
        stdio: ["ignore", "pipe", "pipe"],
        env,
        shell: true,
      });

      child.stdout?.setEncoding("utf8");
      child.stderr?.setEncoding("utf8");

      child.stdout?.on("data", (chunk: string) => {
        const lines = chunk.split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line) as { type: string; [k: string]: unknown };
            send(parsed);
          } catch {
            send({ type: "log", message: line });
          }
        }
      });

      child.stderr?.on("data", (chunk: string) => {
        send({ type: "log", message: chunk.trim() });
      });

      child.on("error", (err) => {
        send({ type: "error", message: err.message });
        controller.close();
      });

      child.on("close", (code) => {
        if (code !== 0 && code !== null) {
          send({ type: "error", message: `Process exited with code ${code}` });
        }
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
    },
  });
}

/** GET ?galleryId=1 - returns list of image paths that are in the face index for that gallery */
export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { code: 401, message: "Authorization failed" },
      { status: 401 }
    );
  }
  if (user.userGroupId !== 1) {
    return NextResponse.json(
      { code: 403, message: "Forbidden" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const galleryIdParam = searchParams.get("galleryId");
  if (!galleryIdParam) {
    return NextResponse.json(
      { code: 400, message: "galleryId required" },
      { status: 400 }
    );
  }
  const galleryId = Number(galleryIdParam);
  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    select: { galleryPath: true },
  });
  if (!gallery?.galleryPath) {
    return NextResponse.json(
      { code: 404, message: "Gallery not found" },
      { status: 404 }
    );
  }
  const galleryFolder = gallery.galleryPath.replace(/^\/uploads\/gallery\/?/, "").split("/")[0] || "";
  const indexPath = path.join(process.cwd(), "models", `index-${galleryFolder}.json`);

  try {
    const content = await fs.readFile(indexPath, "utf-8");
    const index = JSON.parse(content) as Array<{ image: string }>;
    const indexedPaths = [...new Set(index.map((e) => e.image))];
    return NextResponse.json({ code: 200, data: { indexedPaths } });
  } catch {
    return NextResponse.json({ code: 200, data: { indexedPaths: [] } });
  }
}
