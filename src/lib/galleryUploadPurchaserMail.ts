import dns from "dns";
import type { LookupFunction } from "net";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { prisma } from "@/lib/prisma";

/** Prefer IPv4 for SMTP when IPv6 is unreachable (avoids ENETUNREACH to e.g. Gmail’s IPv6). */
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

async function sendSmtpEmail(to: string, subject: string, text: string): Promise<void> {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.warn("[galleryUploadPurchaserMail] SMTP_HOST is not set; email skipped");
    return;
  }

  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from =
    process.env.SMTP_FROM ||
    (user ? `"My Waldo" <${user}>` : '"My Waldo" <noreply@localhost>');

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    family: 4,
    lookup: ((hostname, _opts, cb) => {
      dns.lookup(hostname, { family: 4 }, (err, address, family) => {
        cb(err, address, family);
      });
    }) as LookupFunction,
    ...(user && pass ? { auth: { user, pass } } : {}),
  } as SMTPTransport.Options);

  await transporter.sendMail({ from, to, subject, text });
}

/**
 * Emails users who have a PAID order containing an OrderItem for this gallery's event (itemId = eventId).
 */
export async function notifyPurchasersOfGalleryImageUpload(
  galleryId: number
): Promise<{ emailed: number; skippedNoSmtp: boolean; skippedNoEvent: boolean }> {
  const gallery = await prisma.gallery.findFirst({
    where: { id: galleryId, deletedAt: null },
    select: { eventId: true, title: true, slug: true },
  });

  if (!gallery?.eventId) {
    return { emailed: 0, skippedNoSmtp: false, skippedNoEvent: true };
  }

  if (!process.env.SMTP_HOST) {
    return { emailed: 0, skippedNoSmtp: true, skippedNoEvent: false };
  }

  const orders = await prisma.order.findMany({
    where: {
      status: "PAID",
      items: { some: { itemId: gallery.eventId } },
    },
    include: {
      user: { select: { email: true, name: true } },
    },
  });
  const recipients = new Map<string, string | null>();
  for (const o of orders) {
    const email = o.user?.email?.trim();
    if (email) recipients.set(email.toLowerCase(), o.user?.name ?? null);
  }

  const galleryLabel = gallery.title || gallery.slug || "your gallery";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  let emailed = 0;
  for (const [email, name] of recipients) {
    const greeting = name ? `Hi ${name},` : "Hi,";
    const text = `${greeting}

New photos have been added to a gallery you have access to: "${galleryLabel}".

You can sign in to your account to view them.
${appUrl ? `\n${appUrl}\n` : ""}
Thank you,
Thornton Studios`;

    try {
      await sendSmtpEmail(
        email,
        `New gallery photos: ${galleryLabel}`,
        text
      );
      emailed += 1;
    } catch (err) {
      console.error("[galleryUploadPurchaserMail] send failed for", email, err);
    }
  }

  return { emailed, skippedNoSmtp: false, skippedNoEvent: false };
}
