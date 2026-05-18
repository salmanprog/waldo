/**
 * If stored URL is absolute (e.g. S3), return as-is.
 * Legacy rows may store `/uploads/gallery/...` — when `AWS_S3_BUCKET_URL` is set, use that base
 * so the same object key on S3 is shown (no localhost), as long as objects exist at that key.
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (url == null || url === "") return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const s3Base = process.env.AWS_S3_BUCKET_URL?.replace(/\/$/, "");
  if (s3Base && /^\/uploads\/gallery\//i.test(normalized)) {
    const key = normalized.replace(/^\//, "");
    return `${s3Base}/${key}`;
  }

  const base = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  return base ? `${base}${normalized}` : normalized;
}
