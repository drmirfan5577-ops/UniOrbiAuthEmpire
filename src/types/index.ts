export type AuthMethod = "otp" | "password" | "smartpin" | "unicode" | "passkey";

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  whatsapp?: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  syncEnabled: boolean;
  syncEmail?: string;
  syncWhatsApp?: string;
  theme: "dark" | "light" | "auto";
}

export interface AuthConfig {
  enabledMethods: AuthMethod[];
  defaultMethod: AuthMethod;
  otpLength: 6 | 8;
  pinLength: 4 | 6;
  unicodeWord?: string;
  autoSyncEnabled: boolean;
  autoSyncScope: "all" | "selected" | "none";
  biometricEnabled: boolean;
  facialRecognitionEnabled: boolean;
  screenLockEnabled: boolean;
  sessionTimeout: number; // minutes
  loginMode: "universal" | "per-app";
}

export interface Passkey {
  id: string;
  name: string;
  type: "biometric" | "screenlock" | "facial" | "hardware";
  deviceName: string;
  createdAt: string;
  lastUsed: string;
  isActive: boolean;
  scope: "universal" | "selected";
  linkedApps: string[];
}

export interface ConnectedApp {
  id: string;
  name: string;
  domain: string;
  icon: string;
  category: string;
  addedAt: string;
  lastAccess: string;
  authMethod: AuthMethod;
  isActive: boolean;
  syncEnabled: boolean;
  useUniversalLogin: boolean;
  customPasskeyId?: string;
}

export interface StoredCredential {
  id: string;
  appId: string;
  appName: string;
  username: string;
  passwordHint: string;
  recoveryEmail?: string;
  recoveryWhatsApp?: string;
  hasBackupFile: boolean;
  pinProtected: boolean;
  createdAt: string;
  updatedAt: string;
  strength: "weak" | "medium" | "strong" | "fortress";
}

export interface BackendIntegration {
  id: string;
  name: string;
  type: "supabase" | "firebase" | "auth0" | "okta" | "cognito" | "custom";
  endpoint: string;
  isConnected: boolean;
  lastSync: string;
  usersManaged: number;
  status: "active" | "inactive" | "error";
}

export interface SyncLog {
  id: string;
  timestamp: string;
  action: string;
  appName: string;
  method: AuthMethod;
  status: "success" | "failed" | "pending";
  deviceName: string;
}

export interface DashboardStats {
  totalApps: number;
  activePasskeys: number;
  syncedAccounts: number;
  securityScore: number;
  lastActivity: string;
  methodsEnabled: number;
}
