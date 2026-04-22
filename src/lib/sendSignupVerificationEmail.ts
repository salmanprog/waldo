import dns from "dns";
import type { LookupFunction } from "net";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

export type SendSignupVerificationEmailParams = {
  to: string;
  name: string | null;
  token: string;
  appOrigin?: string;
};

async function sendSmtpEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<void> {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.warn("[sendSignupVerificationEmail] SMTP_HOST is not set; email skipped");
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
    /** Prefer IPv4 — avoids ENETUNREACH when IPv6 to SMTP (e.g. Gmail) is unreachable */
    family: 4,
    lookup: ((hostname, _opts, cb) => {
      dns.lookup(hostname, { family: 4 }, (err, address, family) => {
        cb(err, address, family);
      });
    }) as LookupFunction,
    ...(user && pass ? { auth: { user, pass } } : {}),
  } as SMTPTransport.Options);

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });
}

/**
 * Sends signup email with link to GET /api/users/verify-email?token=...
 */
export async function sendSignupVerificationEmail({
  to,
  name,
  token,
  appOrigin,
}: SendSignupVerificationEmailParams): Promise<void> {
  const base =
    (process.env.NEXT_PUBLIC_APP_URL || appOrigin || "").replace(/\/$/, "") || "";

  const verifyUrl = base
    ? `${base}/api/users/verify-email?token=${encodeURIComponent(token)}`
    : "";

  const greeting = name?.trim() ? `Hi ${name.trim()},` : "Hi,";
  const subject = "Verify your My Waldo account";

  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const text = verifyUrl
    ? `${greeting}

Please verify your email by clicking the link below (valid for 7 days):

${verifyUrl}

If you did not create an account, you can ignore this email.

Thank you,
Thornton Studios`
    : `${greeting}

Please verify your email using this token (set NEXT_PUBLIC_APP_URL for a clickable link):

${token}

If you did not create an account, you can ignore this email.

Thank you,
Thornton Studios`;

  /** HTML clients: button-shaped link. Email clients block JavaScript — href is the only reliable “click”. */
  const html = verifyUrl
    ? `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;font-family:system-ui,-apple-system,sans-serif;font-size:16px;line-height:1.5;color:#1f2937;">
  <p>${escapeHtml(greeting)}</p>
  <p>Please verify your email using the button below (valid for 7 days):</p>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;">
    <tr>
      <td style="border-radius:8px;background:#2563eb;">
        <a href="${escapeHtml(verifyUrl)}" target="_blank" rel="noopener noreferrer"
          style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
          Verify your email
        </a>
      </td>
    </tr>
  </table>
  <p>If you did not create an account, you can ignore this email.</p>
  <p>Thank you,<br/>Thornton Studios</p>
</body>
</html>`
    : `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;font-family:system-ui,-apple-system,sans-serif;font-size:16px;line-height:1.5;color:#1f2937;">
  <p>${escapeHtml(greeting)}</p>
  <p>Please verify your email using this token (set NEXT_PUBLIC_APP_URL for a verification link):</p>
  <pre style="background:#f3f4f6;padding:12px;border-radius:8px;overflow:auto;">${escapeHtml(token)}</pre>
  <p>If you did not create an account, you can ignore this email.</p>
  <p>Thank you,<br/>Thornton Studios</p>
</body>
</html>`;

  await sendSmtpEmail(to, subject, text, html);
}
