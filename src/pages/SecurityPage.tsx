// ─── Security Control Center ──────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Shield, AlertTriangle, CheckCircle, Zap, Search, Bell, XCircle,
  RefreshCw, Eye, Lock, Scan, Activity, Globe
} from "lucide-react";
import { runSecurityScan, analyzeURL, formatThreatLevel, getLastScanResult, saveLastScan, shouldRunScan } from "@/lib/security";
import type { SecurityScanResult, ThreatLevel } from "@/lib/security";
import { usePasskeys, useCredentials, useAuthConfig } from "@/hooks/useLocalData";
import { cn, formatRelativeTime } from "@/lib/utils";

interface MockThreat {
  id: string;
  type: string;
  level: ThreatLevel;
  title: string;
  description: string;
  time: string;
  resolved: boolean;
}

function ScanRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const color = score >= 85 ? "#10b981" : score >= 65 ? "#06b6d4" : score >= 40 ? "#f59e0b" : "#dc2626";
  return (
    <div className="relative w-36 h-36 mx-auto">
      {/* Outer animated ring */}
      <svg className="absolute inset-0 w-full h-full security-ring" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="1"
          strokeDasharray="4 6" />
      </svg>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s ease, stroke 0.5s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading font-extrabold text-3xl" style={{ color }}>{score}</span>
        <span className="text-xs font-semibold text-gray-500">/ 100</span>
      </div>
    </div>
  );
}

export default function SecurityPage() {
  const { passkeys } = usePasskeys();
  const { credentials } = useCredentials();
  const { config } = useAuthConfig();
  const [scanResult, setScanResult] = useState<SecurityScanResult | null>(getLastScanResult);
  const [scanning, setScanning] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlResult, setUrlResult] = useState<{ safe: boolean; reasons: string[] } | null>(null);
  const [threats, setThreats] = useState<MockThreat[]>([
    { id:"t1", type:"signin", level:"warning", title:"Unrecognized Login Attempt", description:"Sign-in from new IP: 185.220.101.x (Tor exit node)", time: new Date(Date.now()-3600000).toISOString(), resolved: false },
    { id:"t2", type:"link",   level:"critical", title:"Phishing Link Detected", description:"paypal-secure-login.tk tried to access your credentials", time: new Date(Date.now()-7200000).toISOString(), resolved: false },
    { id:"t3", type:"scan",   level:"info",   title:"Routine Scan Complete", description:"24-hour security scan passed — no critical issues", time: new Date(Date.now()-86400000).toISOString(), resolved: true },
  ]);

  const hasBackup = !!localStorage.getItem("ae_last_backup");
  const weakCreds = credentials.filter(c => c.strength === "weak" || c.strength === "medium").length;

  const doScan = useCallback(async () => {
    setScanning(true);
    await new Promise(r => setTimeout(r, 2200));
    const result = runSecurityScan({
      enabledMethods: config.enabledMethods,
      hasPasskey: passkeys.some(p => p.isActive),
      hasBackup,
      autoSyncEnabled: config.autoSyncEnabled,
      appsCount: 4,
      weakCredentials: weakCreds,
    });
    saveLastScan(result);
    setScanResult(result);
    setScanning(false);
    toast.success(`Security scan complete — Score: ${result.score}/100`);
  }, [config, passkeys, hasBackup, weakCreds]);

  useEffect(() => {
    if (shouldRunScan()) doScan();
  }, []);

  function analyzeUrlNow() {
    if (!urlInput.trim()) return;
    const result = analyzeURL(urlInput.trim());
    setUrlResult(result);
    if (!result.safe) {
      toast.error("Threat detected in URL!", { description: result.reasons[0] });
      const t: MockThreat = {
        id: `t${Date.now()}`, type:"link", level:"critical",
        title:"Suspicious URL Scanned", description: `${urlInput}: ${result.reasons.join(", ")}`,
        time: new Date().toISOString(), resolved: false,
      };
      setThreats(prev => [t, ...prev]);
    } else {
      toast.success("URL appears safe — no threats detected");
    }
  }

  function resolveTheat(id: string) {
    setThreats(prev => prev.map(t => t.id === id ? {...t, resolved: true} : t));
    toast.success("Threat marked as resolved");
  }

  const levelInfo = scanResult ? formatThreatLevel(scanResult.level) : formatThreatLevel("info");
  const activeThreats = threats.filter(t => !t.resolved);

  return (
    <div className="space-y-6 max-w-5xl page-enter">
      {/* ALERT BANNER */}
      {activeThreats.some(t => t.level === "critical") && (
        <div className="glass-danger rounded-2xl p-4 border-l-4 border-red-500 animate-[warningFlash_1s_ease-in-out_infinite]">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🚨</div>
            <div>
              <p className="font-heading font-bold text-red-700">CRITICAL THREAT DETECTED</p>
              <p className="text-sm text-red-600">Immediate action required — {activeThreats.filter(t=>t.level==="critical").length} critical security event(s)</p>
            </div>
            <button onClick={() => setThreats(prev => prev.map(t => ({...t, resolved: true})))}
              className="ml-auto px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold">
              Resolve All
            </button>
          </div>
        </div>
      )}

      {/* Header + Score */}
      <div className="gradient-border rounded-3xl p-0.5 shadow-glow-crimson">
        <div className="glass-card rounded-[calc(1.5rem-1px)] p-6 md:p-8 bg-gradient-to-br from-white to-red-50/30">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={activeThreats.some(t=>t.level==="critical") ? "status-dot-danger" : "status-dot-active"} />
                <span className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: levelInfo.color }}>
                  {levelInfo.label} — {scanResult ? formatRelativeTime(scanResult.scannedAt) : "Not scanned"}
                </span>
              </div>
              <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gradient-empire mb-2">Security Control Center</h1>
              <p className="text-sm text-gray-500 mb-4">24-hour automated scanning · Real-time threat detection · Link safety checker</p>
              <button onClick={doScan} disabled={scanning}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl btn-crimson text-sm disabled:opacity-60">
                {scanning ? <><RefreshCw size={16} className="animate-spin" />Scanning…</> : <><Scan size={16} />Run Security Scan</>}
              </button>
            </div>
            <div className="text-center">
              <ScanRing score={scanResult?.score ?? 0} />
              <p className="text-sm font-bold mt-2" style={{ color: levelInfo.color }}>{levelInfo.label} Level</p>
              <p className="text-xs text-gray-400">Security Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Threats", value: activeThreats.length, icon: AlertTriangle, color: "#dc2626", bg: "from-red-50 to-rose-50" },
          { label: "Auth Methods", value: config.enabledMethods.length, icon: Lock, color: "#8b5cf6", bg: "from-violet-50 to-purple-50" },
          { label: "Scans Today", value: 1, icon: Scan, color: "#06b6d4", bg: "from-cyan-50 to-sky-50" },
          { label: "Events Resolved", value: threats.filter(t=>t.resolved).length, icon: CheckCircle, color: "#10b981", bg: "from-emerald-50 to-green-50" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={cn("glass-card shimmer-card rounded-2xl p-4 bg-gradient-to-br border border-white/80", s.bg)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500">{s.label}</p>
                  <p className="font-heading font-extrabold text-2xl mt-1" style={{ color: s.color }}>{s.value}</p>
                </div>
                <Icon size={20} style={{ color: s.color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* URL Threat Scanner */}
        <div className="glass-card rounded-3xl p-6 border border-white/80">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Globe size={20} className="text-brand-aurora" /> Link Safety Scanner
          </h2>
          <div className="flex gap-3 mb-4">
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && analyzeUrlNow()}
              placeholder="Paste URL to scan..."
              className="flex-1 glass rounded-xl px-4 py-2.5 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-aurora/40"
            />
            <button onClick={analyzeUrlNow}
              className="px-5 py-2.5 rounded-xl btn-aurora text-sm flex items-center gap-2">
              <Search size={16} /> Scan
            </button>
          </div>
          {urlResult && (
            <div className={cn("rounded-2xl p-4 border", urlResult.safe
              ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200")}>
              <div className="flex items-center gap-2 mb-2">
                {urlResult.safe
                  ? <CheckCircle size={18} className="text-emerald-600" />
                  : <AlertTriangle size={18} className="text-red-600" />}
                <span className={cn("font-bold text-sm", urlResult.safe ? "text-emerald-700" : "text-red-700")}>
                  {urlResult.safe ? "URL is Safe" : `${urlResult.reasons.length} Threat(s) Found`}
                </span>
              </div>
              {urlResult.reasons.map((r, i) => (
                <p key={i} className="text-xs text-red-600 ml-6">• {r}</p>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">Checks for phishing patterns, impersonation, raw IPs, and malicious TLDs</p>
        </div>

        {/* Scan Issues */}
        <div className="glass-card rounded-3xl p-6 border border-white/80">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-brand-violet" /> Scan Issues
          </h2>
          {scanResult?.issues.length ? (
            <div className="space-y-3">
              {scanResult.issues.map((issue, i) => {
                const info = formatThreatLevel(issue.severity);
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-2xl border"
                    style={{ background: info.bg, borderColor: `${info.color}30` }}>
                    <AlertTriangle size={16} style={{ color: info.color }} className="mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{issue.message}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-700">All Clear!</p>
              <p className="text-sm text-gray-400">No security issues detected</p>
            </div>
          )}
          {scanResult?.recommendations.length ? (
            <div className="mt-4">
              <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Recommendations</p>
              {scanResult.recommendations.map((r, i) => (
                <p key={i} className="text-xs text-gray-500 mb-1 flex items-start gap-1.5">
                  <Zap size={10} className="text-brand-gold mt-0.5 flex-shrink-0" /> {r}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Threat Events */}
      <div className="glass-card rounded-3xl p-6 border border-white/80">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-bold text-lg text-gray-900 flex items-center gap-2">
            <Bell size={20} className="text-brand-crimson" /> Security Events
          </h2>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
            {activeThreats.length} Active
          </span>
        </div>
        <div className="space-y-3">
          {threats.map(t => {
            const info = formatThreatLevel(t.level);
            return (
              <div key={t.id} className={cn(
                "flex items-start gap-4 p-4 rounded-2xl border transition-all",
                t.resolved ? "opacity-50 bg-gray-50 border-gray-100" : "",
              )} style={!t.resolved ? { background: info.bg, borderColor: `${info.color}25` } : {}}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: `${info.color}15` }}>
                  {t.level === "critical" ? "🚨" : t.level === "warning" ? "⚠️" : "ℹ️"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm text-gray-900">{t.title}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                      style={{ color: info.color, background: `${info.color}15` }}>
                      {info.label}
                    </span>
                    {t.resolved && <span className="text-[10px] text-gray-400">Resolved</span>}
                  </div>
                  <p className="text-xs text-gray-500">{t.description}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{formatRelativeTime(t.time)}</p>
                </div>
                {!t.resolved && (
                  <button onClick={() => resolveTheat(t.id)}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/80 text-gray-400 hover:text-emerald-600 transition-colors">
                    <CheckCircle size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto Scan Schedule */}
      <div className="glass-card rounded-3xl p-6 border border-white/80 bg-gradient-to-r from-cyan-50/50 to-emerald-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-aurora to-brand-emerald flex items-center justify-center shadow-glow-aurora">
              <RefreshCw size={22} className="text-white" />
            </div>
            <div>
              <p className="font-heading font-bold text-gray-900">Auto Security Scan</p>
              <p className="text-sm text-gray-500">Runs automatically every 24 hours · Detects threats proactively</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="status-dot-active" />
            <span className="text-sm font-semibold text-emerald-600">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
