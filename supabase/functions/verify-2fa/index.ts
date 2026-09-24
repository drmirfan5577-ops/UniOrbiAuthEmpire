import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Server-side TOTP verification
async function base32Decode(encoded: string): Promise<Uint8Array> {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = encoded.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = 0, value = 0;
  const output: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const idx = alphabet.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { output.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return new Uint8Array(output);
}

async function computeTOTP(secret: string, timestamp: number, digits = 6, period = 30): Promise<string> {
  const counter = Math.floor(timestamp / 1000 / period);
  const keyBytes = await base32Decode(secret);
  const counterBytes = new ArrayBuffer(8);
  const view = new DataView(counterBytes);
  view.setUint32(0, Math.floor(counter / 0x100000000), false);
  view.setUint32(4, counter & 0xffffffff, false);
  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, counterBytes);
  const hash = new Uint8Array(signature);
  const offset = hash[hash.length - 1] & 0x0f;
  const code = ((hash[offset] & 0x7f) << 24) | ((hash[offset+1]&0xff) << 16) | ((hash[offset+2]&0xff) << 8) | (hash[offset+3]&0xff);
  return (code % Math.pow(10, digits)).toString().padStart(digits, "0");
}

async function verifyTOTP(secret: string, token: string, windowSize = 1): Promise<boolean> {
  const now = Date.now();
  for (let i = -windowSize; i <= windowSize; i++) {
    const expected = await computeTOTP(secret, now + i * 30000);
    if (expected === token) return true;
  }
  return false;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { action, totp_token, service_id, secret } = await req.json();

    if (action === "verify") {
      // Fetch secret from DB
      const { data: totpSecret, error } = await supabase
        .from("totp_secrets")
        .select("*")
        .eq("user_id", user.id)
        .eq("id", service_id)
        .single();

      if (error || !totpSecret) {
        return new Response(JSON.stringify({ error: "TOTP secret not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const valid = await verifyTOTP(totpSecret.secret, totp_token);
      if (valid) {
        await supabase.from("totp_secrets").update({ last_used: new Date().toISOString() }).eq("id", service_id);
      }
      return new Response(JSON.stringify({ valid, timestamp: Date.now() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (action === "register") {
      const { data, error } = await supabase.from("totp_secrets").insert({
        user_id: user.id,
        service_name: service_id,
        secret: secret,
        issuer: "AuthEmpire",
      }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, id: data.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (action === "generate-code") {
      // Generate current TOTP for the user's secret
      const { data: totpSecret } = await supabase.from("totp_secrets").select("*").eq("id", service_id).single();
      if (!totpSecret) throw new Error("Not found");
      const code = await computeTOTP(totpSecret.secret, Date.now());
      const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
      return new Response(JSON.stringify({ code, remaining }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("verify-2fa error:", err);
    return new Response(JSON.stringify({ error: `Server error: ${err.message}` }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
