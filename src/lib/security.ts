// ─── Security Scanner & Threat Detection Engine ────────────────────────────

export type ThreatLevel = "safe" | "info" | "warning" | "critical";

export interface ThreatReport {
  id: string;
  type: string;
  level: ThreatLevel;
  title: string;
  description: string;
  url?: string;
  detectedAt: string;
  resolved: boolean;
}

// Patterns for malicious link detection
const PHISHING_PATTERNS = [
  /paypal.*login|login.*paypal/i,
  /secure.*bank.*verify|verify.*bank/i,
  /account.*suspend|suspend.*account/i,
  /confirm.*identity.*click/i,
  /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,        // raw IP address
  /bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly/i,       // URL shorteners
  /\.tk$|\.ml$|\.ga$|\.cf$|\.gq$/i,              // free TLDs common in phishing
];

const SUSPICIOUS_KEYWORDS = [
  "urgent", "verify now", "account suspended", "click here immediately",
  "your account will be deleted", "confirm your password", "unusual activity",
  "update your payment", "limited time offer", "you've been selected",
];

export function analyzeURL(url: string): { safe: boolean; reasons: string[] } {
  const reasons: string[] = [];
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    if (PHISHING_PATTERNS.some((p) => p.test(url))) reasons.push("Matches known phishing pattern");
    if (parsed.hostname.split(".").length > 4) reasons.push("Excessive subdomain depth");
    if (/\d{4,}/.test(parsed.hostname)) reasons.push("Hostname contains unusual numbers");
    if (parsed.hostname.length > 50) reasons.push("Unusually long hostname");
    const knownBrands = ["paypal", "amazon", "google", "microsoft", "apple", "facebook", "bank"];
    for (const brand of knownBrands) {
      if (parsed.hostname.includes(brand) && !parsed.hostname.endsWith(`.${brand}.com`)) {
        reasons.push(`Possible ${brand} impersonation`);
      }
    }
  } catch {
    reasons.push("Invalid URL format");
  }
  return { safe: reasons.length === 0, reasons };
}

export function analyzeText(text: string): { safe: boolean; threats: string[] } {
  const threats: string[] = [];
  const lower = text.toLowerCase();
  for (const kw of SUSPICIOUS_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      threats.push(`Contains suspicious phrase: "${kw}"`);
    }
  }
  return { safe: threats.length === 0, threats };
}

export interface SecurityScanResult {
  score: number;
  level: ThreatLevel;
  issues: Array<{ severity: ThreatLevel; message: string }>;
  recommendations: string[];
  scannedAt: string;
}

export function runSecurityScan(config: {
  enabledMethods: string[];
  hasPasskey: boolean;
  hasBackup: boolean;
  autoSyncEnabled: boolean;
  appsCount: number;
  weakCredentials: number;
  lastScanDate?: string;
}): SecurityScanResult {
  let score = 100;
  const issues: Array<{ severity: ThreatLevel; message: string }> = [];
  const recommendations: string[] = [];

  if (config.enabledMethods.length < 2) {
    score -= 25;
    issues.push({ severity: "warning", message: "Only 1 auth method enabled — use 2+ for Multi-Auth protection" });
    recommendations.push("Enable at least 2 authentication methods");
  }
  if (!config.hasPasskey) {
    score -= 15;
    issues.push({ severity: "warning", message: "No biometric passkey registered on this device" });
    recommendations.push("Register a biometric passkey for strongest local auth");
  }
  if (!config.hasBackup) {
    score -= 20;
    issues.push({ severity: "critical", message: "No encrypted backup exists — credential loss risk is HIGH" });
    recommendations.push("Create a PIN-protected encrypted backup immediately");
  }
  if (config.weakCredentials > 0) {
    score -= config.weakCredentials * 5;
    issues.push({ severity: "warning", message: `${config.weakCredentials} credentials marked as weak/medium strength` });
    recommendations.push("Upgrade weak passwords to fortress-level strength");
  }
  if (config.appsCount > 10 && !config.autoSyncEnabled) {
    score -= 5;
    recommendations.push("Enable auto-sync to keep authentication state consistent");
  }

  score = Math.max(0, Math.min(100, score));
  const level: ThreatLevel =
    score >= 85 ? "safe" : score >= 65 ? "info" : score >= 40 ? "warning" : "critical";

  return { score, level, issues, recommendations, scannedAt: new Date().toISOString() };
}

export function formatThreatLevel(level: ThreatLevel): { label: string; color: string; bg: string } {
  switch (level) {
    case "safe":    return { label: "Secure",   color: "#10b981", bg: "rgba(16,185,129,0.1)"  };
    case "info":    return { label: "Info",     color: "#06b6d4", bg: "rgba(6,182,212,0.1)"   };
    case "warning": return { label: "Warning",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  };
    case "critical":return { label: "Critical", color: "#dc2626", bg: "rgba(220,38,38,0.1)"   };
  }
}

const SCAN_KEY = "ae_last_scan";
export function getLastScanResult(): SecurityScanResult | null {
  const raw = localStorage.getItem(SCAN_KEY);
  return raw ? JSON.parse(raw) : null;
}
export function saveLastScan(result: SecurityScanResult) {
  localStorage.setItem(SCAN_KEY, JSON.stringify(result));
}
export function shouldRunScan(): boolean {
  const last = getLastScanResult();
  if (!last) return true;
  return Date.now() - new Date(last.scannedAt).getTime() > 24 * 60 * 60 * 1000;
}
