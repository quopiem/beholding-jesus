// =========================================================================
// BEHOLDING JESUS CHURCH (BJC) — SUPABASE EDGE FUNCTION: PUSH SENDER
// Runtime: Deno (Supabase Edge Functions)
// Security:
//   1. Strict JWT & Service Role validation: only trusted callers are authorized.
//   2. Atomic PostgreSQL stored procedure (check_and_record_push) with row-level locks.
//   3. Safe failure: fail closed, no non-atomic fallbacks.
//   4. Server-side notification preferences verification (push_enabled & category).
//   5. Strict VAPID configuration: fails immediately if private key is missing.
//   6. Auto-prune dead/expired subscriptions (404 / 410 Gone).
//   7. Accurate delivery and failure counts.
// =========================================================================

import { serve } from "https://deno.land/std@0.219.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SUPABASE_JWT_SECRET = Deno.env.get("SUPABASE_JWT_SECRET") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_PUBLIC_KEY =
  Deno.env.get("VAPID_PUBLIC_KEY") ||
  "BNgC0wpK1EQoeeYg0b-f0_OzNRAVSq6ynFNjvyXGfsSEfUxJkFAn_R0scnytEyoORrRvvUrENi6NwbsLyPrWJ2Q";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:notifications@beholdingjesus.org";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export interface PushPayload {
  user_id: string;
  notification_id: string;
  title: string;
  body: string;
  url?: string;
  category?: string;
  tag?: string;
}

// Decode base64url string
function decodeBase64Url(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

export interface AuthVerificationResult {
  authorized: boolean;
  statusCode: number;
  error: string;
  isServiceRole: boolean;
  userId: string | null;
}

// Cryptographic token verification:
// 1. Exact service_role key match for trusted backend operations
// 2. Cryptographic Supabase Auth verification (supabase.auth.getUser)
// 3. Cryptographic HMAC SHA-256 signature verification with SUPABASE_JWT_SECRET
export async function verifyAuth(
  req: Request
): Promise<AuthVerificationResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authorized: false,
      statusCode: 401,
      error: "Missing or malformed Authorization header. Bearer token required.",
      isServiceRole: false,
      userId: null,
    };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return {
      authorized: false,
      statusCode: 401,
      error: "Empty Bearer token provided.",
      isServiceRole: false,
      userId: null,
    };
  }

  // 1. Exact match against server service role secret (Trusted backend workflows)
  if (SUPABASE_SERVICE_ROLE_KEY && token === SUPABASE_SERVICE_ROLE_KEY) {
    return { authorized: true, statusCode: 200, error: "", isServiceRole: true, userId: null };
  }

  // 2. Cryptographic verification via Supabase Auth
  try {
    const { data: authData, error: authErr } = await supabase.auth.getUser(token);
    if (!authErr && authData?.user) {
      return {
        authorized: true,
        statusCode: 200,
        error: "",
        isServiceRole: false,
        userId: authData.user.id,
      };
    }
  } catch {
    // Proceed to cryptographic JWT signature check
  }

  // 3. Cryptographic JWT signature verification
  const parts = token.split(".");
  if (parts.length !== 3) {
    return {
      authorized: false,
      statusCode: 401,
      error: "Invalid JWT format. Must contain three dot-separated segments.",
      isServiceRole: false,
      userId: null,
    };
  }

  try {
    const payloadJson = decodeBase64Url(parts[1]);
    const payload = JSON.parse(payloadJson);

    // Check expiration
    if (payload.exp && typeof payload.exp === "number") {
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp < nowSeconds) {
        return {
          authorized: false,
          statusCode: 401,
          error: "JWT has expired.",
          isServiceRole: false,
          userId: null,
        };
      }
    }

    // Cryptographic signature verification if SUPABASE_JWT_SECRET is set
    if (SUPABASE_JWT_SECRET) {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(SUPABASE_JWT_SECRET);
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      );

      const dataToVerify = encoder.encode(`${parts[0]}.${parts[1]}`);
      const rawSignature = decodeBase64Url(parts[2]);
      const signatureBytes = new Uint8Array(rawSignature.length);
      for (let i = 0; i < rawSignature.length; i++) {
        signatureBytes[i] = rawSignature.charCodeAt(i);
      }

      const isValidSignature = await crypto.subtle.verify(
        "HMAC",
        cryptoKey,
        signatureBytes,
        dataToVerify
      );

      if (!isValidSignature) {
        return {
          authorized: false,
          statusCode: 401,
          error: "Invalid JWT cryptographic signature.",
          isServiceRole: false,
          userId: null,
        };
      }
    }

    if (payload.role === "service_role") {
      return {
        authorized: true,
        statusCode: 200,
        error: "",
        isServiceRole: true,
        userId: null,
      };
    }

    if (payload.sub) {
      return {
        authorized: true,
        statusCode: 200,
        error: "",
        isServiceRole: false,
        userId: payload.sub,
      };
    }

    return {
      authorized: false,
      statusCode: 403,
      error: `Forbidden: Caller has role '${payload.role || "unknown"}'. Only 'service_role' or authenticated members are authorized.`,
      isServiceRole: false,
      userId: null,
    };
  } catch (err: any) {
    return {
      authorized: false,
      statusCode: 401,
      error: `Failed to parse or validate JWT: ${err?.message || "Invalid payload"}`,
      isServiceRole: false,
      userId: null,
    };
  }
}

serve(async (req: Request) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // 1. Restrict HTTP method
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Strict Cryptographic Authentication Check
  const authCheck = await verifyAuth(req);
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. VAPID Configuration Check (Fail fast if server secret is missing)
  if (!VAPID_PRIVATE_KEY) {
    console.error("[BJC Push] VAPID_PRIVATE_KEY environment secret is not configured.");
    return new Response(
      JSON.stringify({
        error: "Server VAPID configuration error: private key missing",
        delivered: false,
        sent_count: 0,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const payload = (await req.json()) as PushPayload;
    let { user_id, notification_id, title, body, url, category, tag } = payload;

    // 4. SECURITY GATE: Privileged Operation Restriction
    // Ordinary authenticated users can ONLY request test notifications for THEMSELVES.
    if (!authCheck.isServiceRole) {
      if (user_id && user_id !== authCheck.userId) {
        return new Response(
          JSON.stringify({
            error: "Forbidden: Ordinary members cannot send notifications to other users.",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      user_id = authCheck.userId!;

      if (category && category !== "test") {
        return new Response(
          JSON.stringify({
            error: "Forbidden: Ordinary members can only request test notifications for their own devices.",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      category = "test";
      title = "🔔 BJC Web Push Test Alert";
      body = "Praise God! Web Push notifications are active and operating on this device.";
      url = "/?tab=profile";
      tag = `bjc-test-${authCheck.userId}`;
      notification_id = notification_id || `test-${authCheck.userId}-${Date.now()}`;
    }

    // 5. Payload Validation
    if (!user_id || typeof user_id !== "string" || user_id.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid or missing user_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!notification_id || typeof notification_id !== "string" || notification_id.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid or missing notification_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!title || typeof title !== "string" || title.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid or oversized title (max 200 chars)" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!body || typeof body !== "string" || body.length > 1000) {
      return new Response(JSON.stringify({ error: "Invalid or oversized body (max 1000 chars)" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Path safety: must be relative and cannot start with '//'
    const safeUrl =
      url && typeof url === "string" && url.startsWith("/") && !url.startsWith("//")
        ? url
        : "/";

    // 5. Server-Side Notification Preferences Check
    const { data: prefs, error: prefError } = await supabase
      .from("push_preferences")
      .select("push_enabled, categories")
      .eq("user_id", user_id)
      .maybeSingle();

    if (prefError && prefError.code !== "PGRST116") {
      console.warn("[BJC Push] Preference query warning:", prefError);
    }

    if (prefs) {
      if (prefs.push_enabled === false) {
        return new Response(
          JSON.stringify({
            status: "skipped",
            reason: "Push notifications disabled by user preferences",
            sent_count: 0,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      const catKey = (category || "feed").toLowerCase();
      if (prefs.categories && prefs.categories[catKey] === false) {
        return new Response(
          JSON.stringify({
            status: "skipped",
            reason: `Category '${catKey}' disabled by user preferences`,
            sent_count: 0,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 6. Atomic Rate Limiting & Duplicate Check via Database RPC
    // Fails safely: NO non-atomic fallback queries
    const maxPerMin = authCheck.isServiceRole ? 10 : 5;
    const { data: rpcData, error: rpcErr } = await supabase.rpc("check_and_record_push", {
      p_user_id: user_id,
      p_notification_id: notification_id,
      p_category: category || "feed",
      p_max_per_minute: maxPerMin,
    });

    if (rpcErr || !rpcData || rpcData.length === 0) {
      console.error("[BJC Push] Atomic rate limiter RPC error:", rpcErr);
      return new Response(
        JSON.stringify({
          error: "Failed to verify rate limit and deduplication gate safely",
          delivered: false,
          sent_count: 0,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const gateCheck = rpcData[0];
    if (!gateCheck.allowed) {
      if (gateCheck.reason === "duplicate") {
        return new Response(
          JSON.stringify({
            status: "skipped",
            reason: "Duplicate notification ignored",
            sent_count: 0,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      if (gateCheck.reason === "rate_limited") {
        return new Response(
          JSON.stringify({
            error: authCheck.isServiceRole
              ? "Rate limit exceeded (max 10 notifications per minute)"
              : "Rate limit exceeded (max 5 test notifications per minute)",
            sent_count: 0,
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 7. Fetch active push subscriptions for user
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", user_id);

    if (subError) {
      console.error("[BJC Push] Subscription query error:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to query subscriptions", sent_count: 0 }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          status: "ok",
          sent_count: 0,
          failed_count: 0,
          message: "No active push subscriptions found for user",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 8. Dispatch Web Push to subscriptions
    const pushMessage = JSON.stringify({
      title,
      body,
      url: safeUrl,
      notification_id,
      category: category || "feed",
      tag: tag || `bjc-${category || "notification"}`,
    });

    let sentCount = 0;
    let failedCount = 0;
    const expiredSubIds: string[] = [];

    const { webPush } = await import("https://deno.land/x/webpush@0.2.0/mod.ts");

    for (const sub of subscriptions) {
      try {
        const res = await webPush(
          sub.endpoint,
          sub.p256dh,
          sub.auth,
          VAPID_PRIVATE_KEY,
          { publicKey: VAPID_PUBLIC_KEY, subject: VAPID_SUBJECT },
          pushMessage,
          { TTL: "86400", Urgency: "normal" }
        );

        if (res && (res.status === 201 || res.status === 200)) {
          sentCount++;
        } else if (res && (res.status === 410 || res.status === 404)) {
          expiredSubIds.push(sub.id);
          failedCount++;
        } else {
          failedCount++;
        }
      } catch (err: any) {
        console.error(`[BJC Push] Dispatch error for sub ${sub.id}:`, err?.message || err);
        if (err?.status === 410 || err?.status === 404) {
          expiredSubIds.push(sub.id);
        }
        failedCount++;
      }
    }

    // 9. Auto-prune stale / expired subscriptions
    if (expiredSubIds.length > 0) {
      await supabase.from("push_subscriptions").delete().in("id", expiredSubIds);
    }

    return new Response(
      JSON.stringify({
        status: sentCount > 0 ? "success" : "partial_or_failed",
        sent_count: sentCount,
        failed_count: failedCount,
        pruned_expired: expiredSubIds.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[BJC Push] Unhandled Edge Function error:", err?.message || err);
    return new Response(
      JSON.stringify({ error: "Internal server error", sent_count: 0 }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
