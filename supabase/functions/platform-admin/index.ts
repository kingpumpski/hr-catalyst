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

type ActionBody = {
  action?: unknown;
  email?: unknown;
  userId?: unknown;
};

const validEmail = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length <= 320 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const validId = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "method_not_allowed" });

  const authorization = request.headers.get("Authorization") ?? "";
  const jwt = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!jwt) return json(401, { error: "authentication_required" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const siteUrl = Deno.env.get("HR_CATALYST_SITE_URL");
  if (!supabaseUrl || !serviceRoleKey || !anonKey || !siteUrl) {
    console.error("Platform admin function environment is incomplete");
    return json(503, { error: "service_unavailable" });
  }

  const verifier = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await verifier.auth.getUser(jwt);
  if (authError || !authData.user) return json(401, { error: "invalid_session" });
  const actor = authData.user;

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: grant, error: grantError } = await admin
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", actor.id)
    .maybeSingle();
  if (grantError) {
    console.error("Platform admin authorization lookup failed", grantError.message);
    return json(503, { error: "authorization_unavailable" });
  }
  if (!grant) return json(403, { error: "platform_admin_required" });

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 16_384) return json(413, { error: "request_too_large" });

  let body: ActionBody;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const action = typeof body.action === "string" ? body.action : "";
  let targetUserId: string | null = null;
  let auditMetadata: Record<string, unknown> = {};
  let response: Record<string, unknown>;

  if (action === "list-users") {
    const { data: users, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
    if (usersError) {
      console.error("Platform user listing failed", usersError.message);
      return json(502, { error: "user_listing_failed" });
    }
    const { data: admins, error: adminsError } = await admin.from("platform_admins").select("user_id");
    if (adminsError) return json(502, { error: "administrator_listing_failed" });
    const adminIds = new Set((admins ?? []).map((row) => row.user_id));
    response = {
      users: users.users.map((user) => ({
        id: user.id,
        email: user.email ?? null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at ?? null,
        email_confirmed_at: user.email_confirmed_at ?? null,
        banned_until: user.banned_until ?? null,
        is_platform_admin: adminIds.has(user.id),
      })),
      page: 1,
      per_page: 100,
      total_in_page: users.users.length,
    };
    auditMetadata = { returned: users.users.length, page: 1 };
  } else if (action === "invite-user") {
    if (!validEmail(body.email)) return json(400, { error: "valid_email_required" });
    const email = body.email.trim().toLowerCase();
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: new URL("/auth", siteUrl).toString(),
    });
    if (error) {
      console.error("Platform invitation failed", error.message);
      return json(400, { error: "invitation_failed" });
    }
    targetUserId = data.user?.id ?? null;
    response = { invited: true };
    auditMetadata = { email_domain: email.split("@")[1] };
  } else if (action === "suspend-user" || action === "restore-user") {
    if (!validId(body.userId)) return json(400, { error: "valid_user_id_required" });
    targetUserId = body.userId;
    if (targetUserId === actor.id) return json(400, { error: "cannot_change_own_access" });
    const { data: target, error: lookupError } = await admin.auth.admin.getUserById(targetUserId);
    if (lookupError || !target.user) return json(404, { error: "user_not_found" });
    const { error } = await admin.auth.admin.updateUserById(targetUserId, {
      ban_duration: action === "suspend-user" ? "876000h" : "none",
    });
    if (error) {
      console.error("Platform account status update failed", error.message);
      return json(502, { error: "account_update_failed" });
    }
    response = { updated: true };
  } else if (action === "grant-admin" || action === "revoke-admin") {
    if (!validId(body.userId)) return json(400, { error: "valid_user_id_required" });
    targetUserId = body.userId;
    if (action === "revoke-admin" && targetUserId === actor.id) {
      return json(400, { error: "cannot_revoke_own_administrator_access" });
    }
    const { data: target, error: lookupError } = await admin.auth.admin.getUserById(targetUserId);
    if (lookupError || !target.user) return json(404, { error: "user_not_found" });

    if (action === "grant-admin") {
      const { error } = await admin.from("platform_admins").upsert(
        { user_id: targetUserId, granted_by: actor.id },
        { onConflict: "user_id" },
      );
      if (error) return json(502, { error: "administrator_grant_failed" });
    } else {
      // The database function serializes removals and writes the audit row
      // atomically, so concurrent revocations cannot remove every admin.
      const { data: revoked, error } = await admin.rpc("revoke_platform_admin_safely", {
        p_actor_id: actor.id,
        p_target_user_id: targetUserId,
      });
      if (error) {
        console.error("Platform administrator revocation failed", error.message);
        return json(502, { error: "administrator_revoke_failed" });
      }
      if (!revoked) return json(409, { error: "cannot_remove_last_administrator_or_user_is_not_admin" });
    }
    response = { updated: true };
  } else {
    return json(400, { error: "unsupported_action" });
  }

  // revoke-admin is audited atomically inside its database transaction.
  if (action !== "revoke-admin") {
    const { error: auditError } = await admin.from("platform_admin_audit").insert({
      actor_id: actor.id,
      action,
      target_user_id: targetUserId,
      metadata: auditMetadata,
    });
    if (auditError) {
      console.error("Platform admin audit insert failed", auditError.message);
      return json(500, { error: "audit_write_failed" });
    }
  }

  return json(200, response);
});
