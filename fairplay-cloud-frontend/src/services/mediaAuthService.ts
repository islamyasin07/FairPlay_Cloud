import { apiFetch } from "./api";

/**
 * Sends a full S3 URL or object key to the backend to get a temporary, authenticated 15-minute viewing link.
 */
export async function getSecureMediaUrl(urlOrKey: string): Promise<string | null> {
  if (!urlOrKey) return null;
  
  try {
    const response = await apiFetch("/media/presigned-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urlOrKey }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch secure media url`);
    }

    const data = await response.json();
    return data.secureUrl;
  } catch (error) {
    console.error("Error securing media:", error);
    return null;
  }
}
