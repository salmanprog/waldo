export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function loginRedirect(req: Request, query: string): NextResponse {
  const base =
    (process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin).replace(/\/$/, "") ||
    new URL(req.url).origin;
  const url = `${base}/login?emailVerify=${encodeURIComponent(query)}`;
  return NextResponse.redirect(url);
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token")?.trim();
  if (!token) {
    return loginRedirect(req, "invalid");
  }

  const user = await prisma.user.findFirst({
    where: { emailOtp: token, deletedAt: null },
  });

  if (!user?.emailOtpCreatedAt) {
    return loginRedirect(req, "invalid");
  }

  if (Date.now() - user.emailOtpCreatedAt.getTime() > TOKEN_MAX_AGE_MS) {
    return loginRedirect(req, "expired");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerify: true,
      emailVerifyAt: new Date(),
      emailOtp: null,
      emailOtpCreatedAt: null,
    },
  });

  return loginRedirect(req, "verified");
}
