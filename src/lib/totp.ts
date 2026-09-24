// ─── Pure Browser TOTP Engine (RFC 6238 / HMAC-SHA1) ──────────────────────
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0, value = 0, output = "";
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  while (output.length % 8 !== 0) output += "=";
  return output;
}

export function base32Decode(encoded: string): Uint8Array {
  const clean = encoded.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = 0, value = 0;
  const output: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(output);
}

export function generateTOTPSecret(length = 20): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base32Encode(bytes).replace(/=+$/, "");
}

export async function computeTOTP(
  secret: string,
  timestamp: number = Date.now(),
  digits = 6,
  period = 30
): Promise<string> {
  const counter = Math.floor(timestamp / 1000 / period);
  const keyBytes = base32Decode(secret);
  const counterBytes = new ArrayBuffer(8);
  const view = new DataView(counterBytes);
  view.setUint32(0, Math.floor(counter / 0x100000000), false);
  view.setUint32(4, counter & 0xffffffff, false);

  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyBytes,
    { name: "HMAC", hash: "SHA-1" },
    false, ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, counterBytes);
  const hash = new Uint8Array(signature);
  const offset = hash[hash.length - 1] & 0x0f;
  const code =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  return (code % Math.pow(10, digits)).toString().padStart(digits, "0");
}

export async function verifyTOTP(
  secret: string,
  token: string,
  window = 1,
  digits = 6,
  period = 30
): Promise<boolean> {
  const now = Date.now();
  for (let i = -window; i <= window; i++) {
    const expected = await computeTOTP(secret, now + i * period * 1000, digits, period);
    if (expected === token) return true;
  }
  return false;
}

export function getTOTPRemainingSeconds(period = 30): number {
  return period - (Math.floor(Date.now() / 1000) % period);
}

export function buildTOTPUri(
  secret: string,
  accountName: string,
  issuer = "AuthEmpire"
): string {
  const enc = encodeURIComponent;
  return `otpauth://totp/${enc(issuer)}:${enc(accountName)}?secret=${secret}&issuer=${enc(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

export function getQRCodeURL(uri: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(uri)}&bgcolor=ffffff&color=1e1b4b&margin=2`;
}

// ─── One-Time Short Key Generator (like GitHub 2FA recovery) ──────────────
export function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const part1 = Math.random().toString(36).substring(2, 7).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 7).toUpperCase();
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}

// ─── HOTP (counter-based, for single-use codes) ───────────────────────────
export async function generateHOTP(secret: string, counter: number): Promise<string> {
  const keyBytes = base32Decode(secret);
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(4, counter, false);
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, buf);
  const hash = new Uint8Array(sig);
  const offset = hash[19] & 0x0f;
  const code = ((hash[offset] & 0x7f) << 24) | (hash[offset+1] << 16) | (hash[offset+2] << 8) | hash[offset+3];
  return (code % 1000000).toString().padStart(6, "0");
}
