export type ResolvedShare = {
  document: {
    title: string;
    type: "cv" | "resume" | "cover_letter" | "other";
    content: unknown;
  };
  download: {
    allowed: boolean;
    url?: string | null;
    expiresInSeconds?: number;
  };
};

export class ShareResolutionError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "ShareResolutionError";
  }
}

type Fetcher = typeof fetch;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isResolvedShare = (value: unknown): value is ResolvedShare => {
  if (!isRecord(value) || !isRecord(value.document) || !isRecord(value.download)) return false;
  const { document, download } = value;
  return typeof document.title === "string" &&
    ["cv", "resume", "cover_letter", "other"].includes(String(document.type)) &&
    "content" in document &&
    typeof download.allowed === "boolean" &&
    (download.url == null || typeof download.url === "string");
};

/** Resolve a high-entropy share token without exposing private tables to anonymous clients. */
export const resolveShare = async (
  token: string,
  options: { signal?: AbortSignal; accessToken?: string; fetcher?: Fetcher } = {},
): Promise<ResolvedShare> => {
  const normalizedToken = token.trim();
  if (normalizedToken.length < 32 || normalizedToken.length > 256) {
    throw new ShareResolutionError("This sharing link is invalid or incomplete.", 400, "invalid_token");
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/+$/, "");
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    throw new ShareResolutionError("Secure document sharing is not configured on this site.", 503, "configuration_missing");
  }

  const headers: Record<string, string> = {
    apikey: publishableKey,
    "Content-Type": "application/json",
  };
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;

  const response = await (options.fetcher ?? fetch)(
    `${supabaseUrl}/functions/v1/resolve-share`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ token: normalizedToken }),
      cache: "no-store",
      signal: options.signal,
    },
  );

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ShareResolutionError("The secure sharing service returned an invalid response.", response.status, "invalid_response");
  }

  if (!response.ok) {
    const code = isRecord(payload) && typeof payload.error === "string" ? payload.error : "share_unavailable";
    const message = response.status === 401
      ? "Sign in with the invited email address to view this document."
      : response.status === 404
        ? "This sharing link is invalid, expired or has been revoked."
        : response.status === 429
          ? "This link has received too many requests. Please wait and try again."
          : "This shared document is temporarily unavailable.";
    throw new ShareResolutionError(message, response.status, code);
  }

  if (!isResolvedShare(payload)) {
    throw new ShareResolutionError("The secure sharing service returned an incomplete document.", 502, "invalid_payload");
  }

  if (payload.download.url) {
    const signedUrl = new URL(payload.download.url);
    const expectedHost = new URL(supabaseUrl).host;
    if (signedUrl.protocol !== "https:" || signedUrl.host !== expectedHost) {
      throw new ShareResolutionError("The document download link failed its security check.", 502, "unsafe_download_url");
    }
  }

  return payload;
};
