// ─── Bright Vibrant Dashboard ─────────────────────────────────────────────
import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Fingerprint, RefreshCw, KeyRound,
  Grid2x2, Server, ArrowRight, Activity, Shield, CheckCircle,
  AlertTriangle, Clock, TrendingUp, Scan, Key, Bell, Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useApps, usePasskeys, useCredentials, useBackends, useSyncLogs, useAuthConfig } from "@/hooks/useLocalData";
import { formatRelativeTime, getSecurityScoreColor, getSecurityScoreLabel } from "@/lib/utils";
import { AUTH_METHOD_INFO } from "@/constants";
import { shouldRunScan, runSecurityScan, getLastScanResult, saveLastScan } from "@/lib/security";
import { cn } from "@/lib/utils";
import type { AuthMethod } from "@/types";

function StatCard({ label, value, sub, icon, gradient, glow }: { label: string; value: string|number; sub: string; icon: React.ReactNode; gradient: string; glow: string }) {
  return (
    <div className={cn("glass-card shimmer-card rounded-3xl p-5 border border-white/80 shadow-card-bright bg-gradient-to-br", gradient)}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm", glow)}>{icon}</div>
        <ArrowRight size={14} className="text-gray-300" />
      </div>
      <p className="font-heading font-extrabold text-3xl text-gray-900 mb-0.5">{value}</p>
      <p className="text-xs font-semibold text-gray-700 mb-0.5">{label}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { apps } = useApps();
  const { passkeys } = usePasskeys();
  const { credentials } = useCredentials();
  const { backends } = useBackends();
  const { logs } = useSyncLogs();
  const { config } = useAuthConfig();
  const [scanResult, setScanResult] = useState(getLastScanResult);
  const [threatAlert, setThreatAlert] = useState(false);

  const securityScore = useMemo(() => {
    let score = 40;
    if (config.enabledMethods.length >= 2) score += 15;
    if (config.enabledMethods.includes("passkey")) score += 10;
    if (config.autoSyncEnabled) score += 10;
    if (passkeys.filter(p => p.isActive).length > 0) score += 15;
    if (credentials.length > 0) score += 10;
    return Math.min(score, 100);
  }, [config, passkeys, credentials]);

  useEffect(() => {
    if (shouldRunScan()) {
      const weakCreds = credentials.filter(c => c.strength === "weak" || c.strength === "medium").length;
      const r = runSecurityScan({
        enabledMethods: config.enabledMethods,
        hasPasskey: passkeys.some(p => p.isActive),
        hasBackup: !!localStorage.getItem("ae_last_backup"),
        autoSyncEnabled: config.autoSyncEnabled,
        appsCount: apps.length,
        weakCredentials: weakCreds,
      });
      saveLastScan(r);
      setScanResult(r);
      if (r.level === "critical" || r.level === "warning") setThreatAlert(true);
    }
  }, []);

  const scoreColor = getSecurityScoreColor(securityScore);
  const circumference = 2 * Math.PI * 34;

  const methodColors: Record<AuthMethod, string> = {
    otp: "#dc2626", password: "#8b5cf6", smartpin: "#f59e0b", unicode: "#10b981", passkey: "#06b6d4",
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Threat Alert Banner */}
      {threatAlert && (
        <div className="glass-danger rounded-2xl p-4 border-l-4 border-red-500 animate-[warningFlash_1s_ease-in-out_infinite] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-bold text-red-700 text-sm">Security Scan Found Issues</p>
              <p className="text-xs text-red-500">{scanResult?.issues.length} issue(s) detected — Score: {scanResult?.score}/100</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/security" className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors">View Details</Link>
            <button onClick={()=>setThreatAlert(false)} className="px-3 py-2 rounded-xl glass border border-red-200 text-red-600 text-xs font-bold">Dismiss</button>
          </div>
        </div>
      )}

      {/* Welcome Hero Card */}
      <div className="gradient-border rounded-3xl p-0.5 shadow-card-glow">
        <div className="glass-card rounded-[calc(1.5rem-1px)] p-6 md:p-8 bg-gradient-to-br from-white to-cyan-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="status-dot-active" />
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">All systems secured · Empire Active</span>
              </div>
              <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gradient-empire mb-2">
                Welcome, <span className="text-gradient-crimson">{user?.displayName?.split(" ")[0] || "Commander"}</span> 👑
              </h1>
              <p className="text-gray-500 text-sm">Last login: {formatRelativeTime(user?.lastLogin || new Date().toISOString())}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Link to="/totp" className="flex items-center gap-2 px-4 py-2 rounded-xl btn-crimson text-xs">
                  <Key size={14} /> TOTP 2FA
                </Link>
                <Link to="/security" className="flex items-center gap-2 px-4 py-2 rounded-xl btn-aurora text-xs">
                  <Scan size={14} /> Security Scan
                </Link>
                <Link to="/backup" className="flex items-center gap-2 px-4 py-2 rounded-xl btn-emerald text-xs">
                  <Shield size={14} /> Backup
                </Link>
              </div>
            </div>

            {/* Security Score */}
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="6" />
                  <circle cx="40" cy="40" r="34" fill="none"
                    stroke={scoreColor} strokeWidth="6"
                    strokeDasharray={`${(securityScore/100)*circumference} ${circumference}`}
                    strokeLinecap="round"
                    style={{transition:"stroke-dashoffset 2s ease, stroke 0.5s ease"}} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading font-extrabold text-xl" style={{color:scoreColor}}>{securityScore}</span>
                  <span className="text-[9px] text-gray-400 font-semibold">score</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-base" style={{color:scoreColor}}>{getSecurityScoreLabel(securityScore)}</p>
                <p className="text-xs text-gray-400">Security Level</p>
                <div className="mt-2 flex items-center gap-1">
                  {[85,90,95,92,88].map((v,i)=>(
                    <div key={i} className="w-1.5 rounded-full transition-all"
                      style={{height:`${(v/100)*24}px`, background:scoreColor, opacity:0.7+(i*0.06)}} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Connected Apps"    value={apps.filter(a=>a.isActive).length}    sub={`${apps.length} total`}         icon={<Grid2x2 size={18}/>}    gradient="from-red-50/50 to-rose-50/30"     glow="bg-brand-crimson" />
        <StatCard label="Active Passkeys"   value={passkeys.filter(p=>p.isActive).length} sub={`${passkeys.length} registered`} icon={<Fingerprint size={18}/>} gradient="from-cyan-50/50 to-sky-50/30"      glow="bg-brand-aurora" />
        <StatCard label="Saved Credentials" value={credentials.length}                   sub="Encrypted locally"               icon={<KeyRound size={18}/>}    gradient="from-violet-50/50 to-purple-50/30" glow="bg-brand-violet" />
        <StatCard label="Backend Hubs"      value={backends.filter(b=>b.isConnected).length} sub={`${backends.length} configured`} icon={<Server size={18}/>}  gradient="from-amber-50/50 to-yellow-50/30" glow="bg-brand-gold" />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Auth Methods */}
        <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-card-bright">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-base text-gray-900 flex items-center gap-2">
              <Shield size={16} className="text-brand-crimson" /> Auth Methods
            </h2>
            <Link to="/auth-setup" className="text-xs text-brand-aurora hover:underline flex items-center gap-1">
              Config <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {(["otp","password","smartpin","unicode","passkey"] as AuthMethod[]).map(m=>{
              const enabled = config.enabledMethods.includes(m);
              return (
                <div key={m} className={cn(
                  "flex items-center justify-between py-2.5 px-3 rounded-2xl border transition-all",
                  enabled ? "border-white/60 bg-white/60" : "border-gray-100 bg-gray-50/50"
                )}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{background:`${methodColors[m]}15`, color:methodColors[m]}}>
                      {m==="otp"?"#":m==="password"?"🔒":m==="smartpin"?"🔢":m==="unicode"?"Ω":"👆"}
                    </div>
                    <span className={cn("text-xs font-semibold", enabled?"text-gray-800":"text-gray-400")}>
                      {AUTH_METHOD_INFO[m].label}
                    </span>
                  </div>
                  <div className={cn("flex items-center gap-1.5 text-xs font-bold",
                    enabled?"text-emerald-600":"text-gray-300")}>
                    {enabled ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
                    {enabled?"ON":"OFF"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-card-bright">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-base text-gray-900 flex items-center gap-2">
              <Activity size={16} className="text-brand-violet" /> Recent Activity
            </h2>
            <Link to="/sync-settings" className="text-xs text-brand-aurora hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-3">
            {logs.slice(0,5).map(log=>(
              <div key={log.id} className="flex items-start gap-2.5">
                <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                  log.status==="success"?"bg-emerald-500":log.status==="failed"?"bg-red-500":"bg-amber-500")} />
                <div className="flex-1">
                  <p className="text-xs text-gray-700 font-medium">{log.action} · <span className="text-brand-aurora">{log.appName}</span></p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={9} className="text-gray-300" />
                    <p className="text-[10px] text-gray-400">{formatRelativeTime(log.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-card-bright">
          <h2 className="font-heading font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
            <Zap size={16} className="text-brand-gold" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              {label:"TOTP 2FA",    path:"/totp",      icon:Key,       gradient:"from-red-50 to-rose-50",    color:"#dc2626"},
              {label:"Security",   path:"/security",  icon:Scan,      gradient:"from-cyan-50 to-sky-50",    color:"#06b6d4"},
              {label:"Backup",     path:"/backup",    icon:Shield,    gradient:"from-emerald-50 to-green-50",color:"#10b981"},
              {label:"Passkeys",   path:"/passkeys",  icon:Fingerprint,gradient:"from-violet-50 to-purple-50",color:"#8b5cf6"},
            ].map(a=>{
              const Icon = a.icon;
              return (
                <Link key={a.label} to={a.path}
                  className={cn("glass rounded-2xl p-3.5 border border-white/70 hover:shadow-md hover:scale-[1.04] transition-all group text-center bg-gradient-to-br", a.gradient)}>
                  <Icon size={20} className="mx-auto mb-2 transition-transform group-hover:scale-110" style={{color:a.color}} />
                  <p className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{a.label}</p>
                </Link>
              );
            })}
          </div>
          <div className="mt-3 glass rounded-2xl p-3 border border-gray-100 bg-gradient-to-r from-emerald-50/50 to-cyan-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw size={13} className={cn(config.autoSyncEnabled?"text-emerald-500 animate-spin-slow":"text-gray-300")} />
                <span className="text-xs text-gray-600 font-medium">Auto Sync</span>
              </div>
              <span className={cn("text-xs font-extrabold", config.autoSyncEnabled?"text-emerald-600":"text-gray-300")}>
                {config.autoSyncEnabled ? "ON" : "OFF"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Apps */}
      <div className="glass-card rounded-3xl p-5 border border-white/80 shadow-card-bright">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-base text-gray-900 flex items-center gap-2">
            <Grid2x2 size={16} className="text-brand-crimson" /> Connected Applications
          </h2>
          <Link to="/connected-apps" className="text-xs text-brand-aurora hover:underline flex items-center gap-1">
            Manage all <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {apps.slice(0,6).map(app=>(
            <div key={app.id} className="glass rounded-2xl p-3 border border-white/70 hover:border-gray-200 hover:shadow-sm transition-all text-center group hover:scale-[1.04] bg-white/60">
              <div className="text-2xl mb-2">{app.icon}</div>
              <p className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 truncate">{app.name}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <div className={cn("w-1.5 h-1.5 rounded-full", app.isActive?"bg-emerald-500":"bg-gray-300")} />
                <span className="text-[9px] text-gray-400">{AUTH_METHOD_INFO[app.authMethod]?.label}</span>
              </div>
            </div>
          ))}
          <Link to="/connected-apps"
            className="glass rounded-2xl p-3 border-2 border-dashed border-gray-200 hover:border-brand-crimson/40 transition-all text-center group flex flex-col items-center justify-center hover:bg-red-50/30">
            <div className="w-8 h-8 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center mb-2 transition-colors">
              <span className="text-brand-crimson text-lg font-bold">+</span>
            </div>
            <p className="text-xs text-gray-400 group-hover:text-brand-crimson transition-colors font-medium">Add App</p>
          </Link>
        </div>
      </div>

      {/* New Features Row */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {title:"Multi-Auth Orders", desc:"Combine any auth methods in custom order or use OneAuth system", path:"/auth-setup", icon:"🔐", gradient:"from-red-50 to-rose-50", color:"#dc2626"},
          {title:"Auto 24h Scan",    desc:"Security scanner runs automatically and alerts on any threat", path:"/security",  icon:"🛡️", gradient:"from-cyan-50 to-sky-50",    color:"#06b6d4"},
          {title:"Encrypted Backup", desc:"AES-256-GCM backup with PIN protection, no server exposure",   path:"/backup",    icon:"🔒", gradient:"from-emerald-50 to-green-50",color:"#10b981"},
        ].map(f=>(
          <Link key={f.title} to={f.path}
            className={cn("glass-card shimmer-card rounded-3xl p-5 border border-white/80 hover:shadow-card-glow hover:scale-[1.02] transition-all bg-gradient-to-br group", f.gradient)}>
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-1 flex items-center gap-2">
              {f.title} <ArrowRight size={12} style={{color:f.color}} className="group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-gray-500">{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
