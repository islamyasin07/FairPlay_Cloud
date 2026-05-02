const fallbackApiBaseUrl = "http://35.174.0.74:3001";
const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim();

const normalizedApiBaseUrl =
  import.meta.env.DEV &&
  (rawApiBaseUrl.length === 0 || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(rawApiBaseUrl))
    ? fallbackApiBaseUrl
    : rawApiBaseUrl
        .replace(/\/+$/, "");
const AUTH_TOKEN_STORAGE_KEY = "fairplay-auth-token";

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedApiBaseUrl}${normalizedPath}`;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedCallback(callback: () => void): void {
  onUnauthorized = callback;
}

export function withAuthHeaders(headers?: HeadersInit): Headers {
  const merged = new Headers(headers ?? {});
  const token = getAuthToken();

  if (token && !merged.has("Authorization")) {
    merged.set("Authorization", `Bearer ${token}`);
  }

  return merged;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: withAuthHeaders(init?.headers),
  });

  if (response.status === 401) {
    clearAuthToken();
    if (onUnauthorized) {
      onUnauthorized();
    }
  }

  return response;
}
