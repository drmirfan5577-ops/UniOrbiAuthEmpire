import type {
  UserProfile,
  AuthConfig,
  Passkey,
  ConnectedApp,
  StoredCredential,
  BackendIntegration,
  SyncLog,
} from "@/types";
import { generateId } from "@/lib/utils";

const KEYS = {
  USER: "ae_user",
  AUTH_CONFIG: "ae_auth_config",
  PASSKEYS: "ae_passkeys",
  APPS: "ae_apps",
  CREDENTIALS: "ae_credentials",
  BACKENDS: "ae_backends",
  SYNC_LOGS: "ae_sync_logs",
  SETUP_COMPLETE: "ae_setup_complete",
  SESSION: "ae_session",
};

// ─── User ──────────────────────────────────────────────────────────────────
export function getUser(): UserProfile | null {
  const raw = localStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export function saveUser(user: UserProfile): void {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
}

// ─── Auth Config ────────────────────────────────────────────────────────────
const DEFAULT_CONFIG: AuthConfig = {
  enabledMethods: ["password"],
  defaultMethod: "password",
  otpLength: 6,
  pinLength: 4,
  unicodeWord: undefined,
  autoSyncEnabled: false,
  autoSyncScope: "none",
  biometricEnabled: false,
  facialRecognitionEnabled: false,
  screenLockEnabled: false,
  sessionTimeout: 30,
  loginMode: "universal",
};

export function getAuthConfig(): AuthConfig {
  const raw = localStorage.getItem(KEYS.AUTH_CONFIG);
  return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
}

export function saveAuthConfig(config: AuthConfig): void {
  localStorage.setItem(KEYS.AUTH_CONFIG, JSON.stringify(config));
}

// ─── Passkeys ───────────────────────────────────────────────────────────────
export function getPasskeys(): Passkey[] {
  const raw = localStorage.getItem(KEYS.PASSKEYS);
  return raw ? JSON.parse(raw) : [];
}

export function savePasskey(passkey: Passkey): void {
  const all = getPasskeys();
  const idx = all.findIndex((p) => p.id === passkey.id);
  if (idx >= 0) all[idx] = passkey;
  else all.push(passkey);
  localStorage.setItem(KEYS.PASSKEYS, JSON.stringify(all));
}

export function deletePasskey(id: string): void {
  const all = getPasskeys().filter((p) => p.id !== id);
  localStorage.setItem(KEYS.PASSKEYS, JSON.stringify(all));
}

// ─── Connected Apps ─────────────────────────────────────────────────────────
export function getApps(): ConnectedApp[] {
  const raw = localStorage.getItem(KEYS.APPS);
  if (raw) return JSON.parse(raw);
  // seed demo apps
  const demos: ConnectedApp[] = [
    { id: "app-1", name: "Gmail", domain: "gmail.com", icon: "📧", category: "Email", addedAt: new Date(Date.now() - 86400000 * 10).toISOString(), lastAccess: new Date(Date.now() - 3600000).toISOString(), authMethod: "password", isActive: true, syncEnabled: true, useUniversalLogin: true },
    { id: "app-2", name: "WhatsApp Web", domain: "web.whatsapp.com", icon: "💬", category: "Social Media", addedAt: new Date(Date.now() - 86400000 * 7).toISOString(), lastAccess: new Date(Date.now() - 1800000).toISOString(), authMethod: "passkey", isActive: true, syncEnabled: true, useUniversalLogin: false },
    { id: "app-3", name: "GitHub", domain: "github.com", icon: "🐙", category: "Work", addedAt: new Date(Date.now() - 86400000 * 5).toISOString(), lastAccess: new Date(Date.now() - 7200000).toISOString(), authMethod: "otp", isActive: true, syncEnabled: false, useUniversalLogin: false },
    { id: "app-4", name: "Bank Portal", domain: "mybank.com", icon: "🏦", category: "Banking", addedAt: new Date(Date.now() - 86400000 * 3).toISOString(), lastAccess: new Date(Date.now() - 86400000).toISOString(), authMethod: "smartpin", isActive: true, syncEnabled: false, useUniversalLogin: false },
  ];
  localStorage.setItem(KEYS.APPS, JSON.stringify(demos));
  return demos;
}

export function saveApp(app: ConnectedApp): void {
  const all = getApps();
  const idx = all.findIndex((a) => a.id === app.id);
  if (idx >= 0) all[idx] = app;
  else all.push(app);
  localStorage.setItem(KEYS.APPS, JSON.stringify(all));
}

export function deleteApp(id: string): void {
  const all = getApps().filter((a) => a.id !== id);
  localStorage.setItem(KEYS.APPS, JSON.stringify(all));
}

// ─── Credentials ─────────────────────────────────────────────────────────────
export function getCredentials(): StoredCredential[] {
  const raw = localStorage.getItem(KEYS.CREDENTIALS);
  if (raw) return JSON.parse(raw);
  const demos: StoredCredential[] = [
    { id: "cred-1", appId: "app-1", appName: "Gmail", username: "user@gmail.com", passwordHint: "My••••••••2024", recoveryEmail: "backup@email.com", hasBackupFile: true, pinProtected: true, createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(), strength: "strong" },
    { id: "cred-2", appId: "app-3", appName: "GitHub", username: "dev_user", passwordHint: "Dev••••••••!", recoveryEmail: "backup@email.com", hasBackupFile: false, pinProtected: false, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(), strength: "fortress" },
  ];
  localStorage.setItem(KEYS.CREDENTIALS, JSON.stringify(demos));
  return demos;
}

export function saveCredential(cred: StoredCredential): void {
  const all = getCredentials();
  const idx = all.findIndex((c) => c.id === cred.id);
  if (idx >= 0) all[idx] = cred;
  else all.push(cred);
  localStorage.setItem(KEYS.CREDENTIALS, JSON.stringify(all));
}

export function deleteCredential(id: string): void {
  const all = getCredentials().filter((c) => c.id !== id);
  localStorage.setItem(KEYS.CREDENTIALS, JSON.stringify(all));
}

// ─── Backends ─────────────────────────────────────────────────────────────
export function getBackends(): BackendIntegration[] {
  const raw = localStorage.getItem(KEYS.BACKENDS);
  if (raw) return JSON.parse(raw);
  const demos: BackendIntegration[] = [
    { id: "be-1", name: "Production Supabase", type: "supabase", endpoint: "https://project.supabase.co", isConnected: true, lastSync: new Date(Date.now() - 600000).toISOString(), usersManaged: 1240, status: "active" },
    { id: "be-2", name: "Auth0 Enterprise", type: "auth0", endpoint: "https://tenant.auth0.com", isConnected: false, lastSync: new Date(Date.now() - 86400000).toISOString(), usersManaged: 0, status: "inactive" },
  ];
  localStorage.setItem(KEYS.BACKENDS, JSON.stringify(demos));
  return demos;
}

export function saveBackend(be: BackendIntegration): void {
  const all = getBackends();
  const idx = all.findIndex((b) => b.id === be.id);
  if (idx >= 0) all[idx] = be;
  else all.push(be);
  localStorage.setItem(KEYS.BACKENDS, JSON.stringify(all));
}

export function deleteBackend(id: string): void {
  const all = getBackends().filter((b) => b.id !== id);
  localStorage.setItem(KEYS.BACKENDS, JSON.stringify(all));
}

// ─── Sync Logs ───────────────────────────────────────────────────────────────
export function getSyncLogs(): SyncLog[] {
  const raw = localStorage.getItem(KEYS.SYNC_LOGS);
  if (raw) return JSON.parse(raw);
  const demos: SyncLog[] = [
    { id: generateId(), timestamp: new Date(Date.now() - 300000).toISOString(), action: "Auto-sync triggered", appName: "Gmail", method: "password", status: "success", deviceName: "This Device" },
    { id: generateId(), timestamp: new Date(Date.now() - 600000).toISOString(), action: "Passkey verification", appName: "WhatsApp Web", method: "passkey", status: "success", deviceName: "This Device" },
    { id: generateId(), timestamp: new Date(Date.now() - 1200000).toISOString(), action: "OTP generated", appName: "GitHub", method: "otp", status: "success", deviceName: "This Device" },
    { id: generateId(), timestamp: new Date(Date.now() - 3600000).toISOString(), action: "PIN verified", appName: "Bank Portal", method: "smartpin", status: "success", deviceName: "This Device" },
  ];
  localStorage.setItem(KEYS.SYNC_LOGS, JSON.stringify(demos));
  return demos;
}

export function addSyncLog(log: Omit<SyncLog, "id">): void {
  const all = getSyncLogs();
  all.unshift({ ...log, id: generateId() });
  if (all.length > 100) all.pop();
  localStorage.setItem(KEYS.SYNC_LOGS, JSON.stringify(all));
}

// ─── Session ─────────────────────────────────────────────────────────────────
export function isSetupComplete(): boolean {
  return localStorage.getItem(KEYS.SETUP_COMPLETE) === "true";
}

export function markSetupComplete(): void {
  localStorage.setItem(KEYS.SETUP_COMPLETE, "true");
}

export function isLoggedIn(): boolean {
  return localStorage.getItem(KEYS.SESSION) === "authenticated";
}

export function setLoggedIn(val: boolean): void {
  if (val) localStorage.setItem(KEYS.SESSION, "authenticated");
  else {
    localStorage.removeItem(KEYS.SESSION);
  }
}

export function clearAll(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
