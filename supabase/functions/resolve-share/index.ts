import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store, private",
  "Pragma": "no-cache",
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

const sha256 = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "method_not_allowed" });

  let body: { token?: unknown };
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (token.length < 32 || token.length > 256) return json(404, { error: "share_not_found" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    console.error("Required Supabase function environment is missing");
    return json(503, { error: "service_unavailable" });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const tokenHash = await sha256(token);
  const { data: link, error: linkError } = await admin
    .from("share_links")
    .select("id, document_id, document_version_id, allow_download, invited_email, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (linkError) {
    console.error("Share lookup failed", linkError.message);
    return json(503, { error: "service_unavailable" });
  }
  if (!link || link.revoked_at || (link.expires_at && Date.parse(link.expires_at) <= Date.now())) {
    return json(404, { error: "share_not_found_or_expired" });
  }

  const { data: withinRateLimit, error: rateLimitError } = await admin.rpc(
    "allow_share_resolution",
    { p_token_hash: tokenHash },
  );
  if (rateLimitError) {
    console.error("Share resolver throttle failed", rateLimitError.message);
    return json(503, { error: "service_unavailable" });
  }
  if (!withinRateLimit) return json(429, { error: "too_many_requests" });

  if (link.invited_email) {
    const authorization = request.headers.get("Authorization") ?? "";
    const jwt = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!jwt) return json(401, { error: "authentication_required" });
    const viewer = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: userData, error: userError } = await viewer.auth.getUser(jwt);
    if (userError || userData.user?.email?.toLowerCase() !== link.invited_email) {
      return json(403, { error: "share_recipient_mismatch" });
    }
    if (!userData.user.email_confirmed_at) {
      return json(403, { error: "email_not_verified" });
    }
  }

  const { data: version, error: versionError } = await admin
    .from("document_versions")
    .select("id, document_type, content_snapshot, storage_path")
    .eq("id", link.document_version_id)
    .eq("document_id", link.document_id)
    .maybeSingle();

  if (versionError || !version) {
    console.error("Published document version unavailable", versionError?.message);
    return json(404, { error: "share_not_found_or_expired" });
  }

  const { data: document, error: documentError } = await admin
    .from("documents")
    .select("title, status")
    .eq("id", link.document_id)
    .maybeSingle();

  if (documentError || !document || document.status !== "published") {
    console.error("Shared document is not published", documentError?.message);
    return json(404, { error: "share_not_found_or_expired" });
  }

  let downloadUrl: string | null = null;
  if (link.allow_download && version.storage_path) {
    const { data: signed, error: signedError } = await admin.storage
      .from("hr-catalyst-private")
      .createSignedUrl(version.storage_path, 60, { download: true });
    if (signedError) {
      console.error("Signed document download could not be created", signedError.message);
      return json(503, { error: "download_temporarily_unavailable" });
    }
    downloadUrl = signed.signedUrl;
  }

  return json(200, {
    document: {
      title: document.title,
      type: version.document_type,
      content: version.content_snapshot,
    },
    download: downloadUrl ? { allowed: true, url: downloadUrl, expiresInSeconds: 60 } : { allowed: false },
  });
});
