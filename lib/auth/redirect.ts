export function getSafeRedirectPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;

  try {
    const url = new URL(value, "https://astra.local");
    if (url.origin !== "https://astra.local") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function getAppOrigin() {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");

  if (configuredOrigin) return configuredOrigin;

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
}

export function getAuthCallbackUrl(nextPath: string) {
  const safeNextPath = getSafeRedirectPath(nextPath, "/dashboard");
  return `${getAppOrigin()}/auth/callback?next=${encodeURIComponent(safeNextPath)}`;
}
