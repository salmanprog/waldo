export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getUserByToken } from "@/utils/token";
import { headGalleryBucket } from "@/lib/s3GalleryUpload";

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

/** GET: verify bucket name + region + credentials (admin only). */
export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ code: 401, message: "Authorization failed" }, { status: 401 });
  }
  if (user.userGroupId !== 1) {
    return NextResponse.json({ code: 403, message: "Forbidden" }, { status: 403 });
  }

  const result = await headGalleryBucket();
  if (result.ok) {
    return NextResponse.json({
      code: 200,
      message: "S3 bucket is reachable with your app configuration.",
      data: { bucket: result.bucket, region: result.region, ok: true },
    });
  }

  return NextResponse.json(
    {
      code: 422,
      message:
        "S3 check failed. Fix bucket name, region, or IAM account mismatch (see data.error).",
      data: {
        bucket: result.bucket,
        region: result.region,
        ok: false,
        awsCode: result.code,
        error: result.error,
      },
    },
    { status: 422 }
  );
}
