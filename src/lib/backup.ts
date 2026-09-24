// ─── Encrypted Backup System (AES-GCM + PIN-derived key) ──────────────────
import { generateId } from "@/lib/utils";

interface BackupPayload {
  version: number;
  createdAt: string;
  deviceId: string;
  data: Record<string, unknown>;
}

async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw", enc.encode(pin), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptBackup(data: Record<string, unknown>, pin: string): Promise<Blob> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pin, salt);
  const payload: BackupPayload = {
    version: 2,
    createdAt: new Date().toISOString(),
    deviceId: getDeviceId(),
    data,
  };
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(JSON.stringify(payload))
  );
  // Format: magic(4) + version(1) + salt(16) + iv(12) + ciphertext
  const magic = new Uint8Array([0xAE, 0xC1, 0x42, 0x01]);
  const version = new Uint8Array([2]);
  const combined = new Uint8Array(
    magic.length + version.length + salt.length + iv.length + encrypted.byteLength
  );
  let offset = 0;
  combined.set(magic, offset); offset += magic.length;
  combined.set(version, offset); offset += version.length;
  combined.set(salt, offset); offset += salt.length;
  combined.set(iv, offset); offset += iv.length;
  combined.set(new Uint8Array(encrypted), offset);
  return new Blob([combined], { type: "application/octet-stream" });
}

export async function decryptBackup(
  file: File,
  pin: string
): Promise<Record<string, unknown>> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  // Validate magic
  if (bytes[0] !== 0xAE || bytes[1] !== 0xC1 || bytes[2] !== 0x42 || bytes[3] !== 0x01) {
    throw new Error("Invalid backup file format");
  }
  let offset = 5; // skip magic + version
  const salt = bytes.slice(offset, offset + 16); offset += 16;
  const iv = bytes.slice(offset, offset + 12); offset += 12;
  const ciphertext = bytes.slice(offset);
  const key = await deriveKey(pin, salt);
  let decrypted: ArrayBuffer;
  try {
    decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  } catch {
    throw new Error("Wrong PIN or corrupted file");
  }
  const text = new TextDecoder().decode(decrypted);
  const payload: BackupPayload = JSON.parse(text);
  return payload.data;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function getDeviceId(): string {
  const stored = localStorage.getItem("ae_device_id");
  if (stored) return stored;
  const id = generateId();
  localStorage.setItem("ae_device_id", id);
  return id;
}

export function buildBackupFilename(): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}_${String(d.getHours()).padStart(2,"0")}${String(d.getMinutes()).padStart(2,"0")}`;
  return `AuthEmpire_Backup_${stamp}.aeb`;
}
