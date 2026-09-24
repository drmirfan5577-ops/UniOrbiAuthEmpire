// ─── Bright SyncSettings Page ─────────────────────────────────────────────
import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Zap, Shield, Clock, CheckCircle, AlertTriangle, Activity, Globe } from "lucide-react";
import { useAuthConfig, useSyncLogs } from "@/hooks/useLocalData";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function SyncSettingsPage() {
  const { config, update } = useAuthConfig();
  const { logs, add } = useSyncLogs();
  const [syncing, setSyncing] = useState(false);

  async function runSync() {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1800));
    add({ timestamp: new Date().toISOString(), action: "Manual sync triggered", appName: "All Apps", method: "otp", status: "success", deviceName: "This Device" });
    setSyncing(false);
    toast.success("Auto-sync completed successfully!");
  }

  return (
    <div className="space-y-6 max-w-3xl page-enter">
      <div className="gradient-border rounded-3xl p-0.5">
        <div className="glass-card rounded-[calc(1.5rem-1px)] p-6 bg-gradient-to-br from-white to-cyan-50/30">
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gradient-empire mb-2 flex items-center gap-3">
            <RefreshCw size={28} className="text-brand-aurora" /> Auto Sync Engine
          </h1>
          <p className="text-sm text-gray-500">Configure same-device OTP auto-syncing with per-app permission control</p>
        </div>
      </div>

      {/* Master Toggle */}
      <div className={cn("glass-card rounded-3xl p-6 border-2 transition-all shadow-card-bright",
        config.autoSyncEnabled ? "border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-cyan-50/30" : "border-gray-100")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("w-14 h-14 rounded-3xl flex items-center justify-center transition-all",
              config.autoSyncEnabled ? "btn-emerald shadow-glow-emerald" : "bg-gray-100")}>
              <RefreshCw size={24} className={cn(config.autoSyncEnabled ? "text-white animate-spin-slow" : "text-gray-400")} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-gray-900">Auto-Sync</h2>
              <p className="text-sm text-gray-500">Sync OTP codes across apps on this device</p>
            </div>
          </div>
          <button onClick={() => { update({ autoSyncEnabled: !config.autoSyncEnabled }); toast.success(`Auto-sync ${!config.autoSyncEnabled ? "enabled" : "disabled"}`); }}
            className={cn("relative w-14 h-7 rounded-full transition-all focus:outline-none",
              config.autoSyncEnabled ? "bg-brand-emerald shadow-glow-emerald" : "bg-gray-200")}>
            <span className={cn("absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform",
              config.autoSyncEnabled ? "translate-x-7" : "translate-x-0.5")} />
          </button>
        </div>
      </div>

      {/* Sync Scope */}
      <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-card-bright">
        <h2 className="font-heading font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Globe size={20} className="text-brand-aurora" /> Sync Scope
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {(["all","selected","none"] as const).map(scope => (
            <button key={scope} onClick={() => update({ autoSyncScope: scope })}
              className={cn("py-3 px-4 rounded-2xl border text-sm font-bold transition-all capitalize",
                config.autoSyncScope === scope
                  ? "btn-aurora border-transparent"
                  : "glass border-gray-200 text-gray-600 hover:border-blue-200")}>
              {scope === "all" ? "All Apps" : scope === "selected" ? "Selected" : "None"}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Sync */}
      <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-card-bright">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-base text-gray-900 mb-1">Manual Sync</h2>
            <p className="text-sm text-gray-500">Trigger an immediate sync of all connected apps</p>
          </div>
          <button onClick={runSync} disabled={syncing}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl btn-crimson text-sm disabled:opacity-60">
            {syncing ? <><RefreshCw size={16} className="animate-spin" />Syncing…</> : <><Zap size={16} />Run Sync</>}
          </button>
        </div>
      </div>

      {/* Sync Logs */}
      <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-card-bright">
        <h2 className="font-heading font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-brand-violet" /> Sync Activity Log
        </h2>
        <div className="space-y-3">
          {logs.slice(0,10).map(log => (
            <div key={log.id} className="flex items-center gap-4 p-3 glass rounded-2xl border border-gray-100 bg-white/60">
              <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0",
                log.status==="success" ? "bg-emerald-500" : log.status==="failed" ? "bg-red-500" : "bg-amber-500")} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{log.action}</p>
                <p className="text-xs text-gray-400">{log.appName} · {log.deviceName}</p>
              </div>
              <div className="flex items-center gap-2">
                {log.status==="success" ? <CheckCircle size={14} className="text-emerald-500" /> : <AlertTriangle size={14} className="text-amber-500" />}
                <span className="text-xs text-gray-400">{formatRelativeTime(log.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
