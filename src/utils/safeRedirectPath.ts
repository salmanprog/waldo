/** Allow only same-site relative paths (open redirect hardening). */
export function safeRedirectPath(raw: string | null | undefined, fallback = "/"): string {
  if (!raw || typeof raw !== "string") return fallback;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  return t;
}
