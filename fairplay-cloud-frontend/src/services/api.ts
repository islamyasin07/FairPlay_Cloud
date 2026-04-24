const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

const normalizedApiBaseUrl = rawApiBaseUrl.replace(/\/+$/, "");

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedApiBaseUrl}${normalizedPath}`;
}
