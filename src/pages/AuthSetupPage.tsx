// ─── Auth Setup: Multi-Auth Orders + OneAuth System ───────────────────────
import { useState } from "react";
import { toast } from "sonner";
import {
  Settings2, Shield, CheckCircle, Hash, Lock, Grid3x3, Type, Fingerprint,
  ArrowRight, ToggleLeft, ToggleRight, Star, Layers, Zap, Save
} from "lucide-react";
import { useAuthConfig } from "@/hooks/useLocalData";
import { AUTH_METHOD_INFO } from "@/constants";
import { cn } from "@/lib/utils";
import type { AuthMethod } from "@/types";

const METHODS: AuthMethod[] = ["otp","password","smartpin","unicode","passkey"];

const METHOD_ICONS: Record<AuthMethod, React.ReactNode> = {
  otp:      <Hash size={20} />,
  password: <Lock size={20} />,
  smartpin: <Grid3x3 size={20} />,
  unicode:  <Type size={20} />,
  passkey:  <Fingerprint size={20} />,
};

const METHOD_GRADIENTS: Record<AuthMethod, string> = {
  otp:      "from-red-50 to-rose-50",
  password: "from-violet-50 to-purple-50",
  smartpin: "from-amber-50 to-yellow-50",
  unicode:  "from-emerald-50 to-green-50",
  passkey:  "from-cyan-50 to-sky-50",
};

export default function AuthSetupPage() {
  const { config, update } = useAuthConfig();
  const [orderMode, setOrderMode] = useState<"multi"|"one">("multi");
  const [authOrder, setAuthOrder] = useState<AuthMethod[]>(config.enabledMethods);
  const [unicodeInput, setUnicodeInput] = useState(config.unicodeWord || "");
  const [saved, setSaved] = useState(false);

  function toggleMethod(m: AuthMethod) {
    const enabled = config.enabledMethods.includes(m);
    let updated: AuthMethod[];
    if (enabled) {
      if (config.enabledMethods.length <= 1) { toast.error("At least one method must remain enabled"); return; }
      updated = config.enabledMethods.filter(x => x !== m);
    } else {
      updated = [...config.enabledMethods, m];
    }
    update({ enabledMethods: updated });
    setAuthOrder(updated);
  }

  function setDefault(m: AuthMethod) {
    update({ defaultMethod: m });
    toast.success(`${AUTH_METHOD_INFO[m].label} set as default method`);
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const arr = [...authOrder];
    [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]];
    setAuthOrder(arr);
  }
  function moveDown(idx: number) {
    if (idx === authOrder.length-1) return;
    const arr = [...authOrder];
    [arr[idx], arr[idx+1]] = [arr[idx+1], arr[idx]];
    setAuthOrder(arr);
  }

  function saveAll() {
    update({
      enabledMethods: authOrder,
      unicodeWord: unicodeInput || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast.success("Auth configuration saved!");
  }

  return (
    <div className="space-y-6 max-w-3xl page-enter">
      {/* Header */}
      <div className="gradient-border rounded-3xl p-0.5">
        <div className="glass-card rounded-[calc(1.5rem-1px)] p-6 bg-gradient-to-br from-white to-violet-50/30">
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gradient-empire mb-2 flex items-center gap-3">
            <Settings2 size={28} className="text-brand-violet" /> Auth Configuration
          </h1>
          <p className="text-sm text-gray-500">Configure Multi-Auth Orders, OneAuth system, and method priorities</p>
        </div>
      </div>

      {/* Auth Order System Toggle */}
      <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-card-bright">
        <h2 className="font-heading font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Layers size={20} className="text-brand-crimson" /> Authentication Order System
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <button onClick={() => setOrderMode("multi")}
            className={cn("p-5 rounded-3xl border-2 transition-all text-left",
              orderMode==="multi"
                ? "border-brand-crimson bg-gradient-to-br from-red-50 to-rose-50 shadow-glow-crimson"
                : "border-gray-100 glass hover:border-red-200")}>
            <div className="flex items-center gap-2 mb-2">
              <Layers size={20} className="text-brand-crimson" />
              <span className="font-heading font-bold text-gray-900">Multi-Auth ORDER</span>
              {orderMode==="multi" && <CheckCircle size={16} className="text-brand-crimson ml-auto" />}
            </div>
            <p className="text-xs text-gray-500">Require multiple auth methods in sequence. Maximum security — configure the order below.</p>
          </button>
          <button onClick={() => setOrderMode("one")}
            className={cn("p-5 rounded-3xl border-2 transition-all text-left",
              orderMode==="one"
                ? "border-brand-aurora bg-gradient-to-br from-cyan-50 to-sky-50 shadow-glow-aurora"
                : "border-gray-100 glass hover:border-blue-200")}>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={20} className="text-brand-aurora" />
              <span className="font-heading font-bold text-gray-900">OneAuth ORDER</span>
              {orderMode==="one" && <CheckCircle size={16} className="text-brand-aurora ml-auto" />}
            </div>
            <p className="text-xs text-gray-500">Single authentication method — fast login with one preferred method.</p>
          </button>
        </div>
      </div>

      {/* Methods Grid */}
      <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-card-bright">
        <h2 className="font-heading font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={20} className="text-brand-emerald" /> Enable / Disable Methods
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {METHODS.map(m => {
            const enabled = config.enabledMethods.includes(m);
            const isDefault = config.defaultMethod === m;
            const info = AUTH_METHOD_INFO[m];
            return (
              <div key={m} className={cn(
                "rounded-3xl p-4 border-2 transition-all",
                enabled
                  ? `bg-gradient-to-br ${METHOD_GRADIENTS[m]} border-white/80 shadow-sm`
                  : "glass border-gray-100 opacity-60"
              )}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{background:`${info.color}15`, color:info.color}}>
                      {METHOD_ICONS[m]}
                    </div>
                    <div>
                      <p className="font-heading font-bold text-sm text-gray-900">{info.label}</p>
                      {isDefault && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1 w-fit mt-0.5">
                          <Star size={8} fill="currentColor" /> Default
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => toggleMethod(m)}
                    className="text-gray-400 hover:text-gray-700 transition-colors">
                    {enabled ? <ToggleRight size={28} style={{color:info.color}} /> : <ToggleLeft size={28} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">{info.description}</p>
                {m==="unicode" && enabled && (
                  <input value={unicodeInput} onChange={e=>setUnicodeInput(e.target.value)}
                    placeholder="Enter your unicode word (e.g., Mango)"
                    className="w-full glass rounded-xl px-3 py-2 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 mb-2" style={{focusRingColor:info.color}} />
                )}
                {enabled && !isDefault && (
                  <button onClick={() => setDefault(m)}
                    className="text-xs font-semibold hover:underline flex items-center gap-1" style={{color:info.color}}>
                    <Star size={10} /> Set as default
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Auth Order (for Multi-Auth) */}
      {orderMode==="multi" && (
        <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-card-bright">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <ArrowRight size={20} className="text-brand-violet" /> Authentication Order
          </h2>
          <p className="text-sm text-gray-500 mb-4">Drag or use arrows to reorder. Users must pass each step in sequence.</p>
          <div className="space-y-2">
            {authOrder.filter(m => config.enabledMethods.includes(m)).map((m, idx, arr) => {
              const info = AUTH_METHOD_INFO[m];
              return (
                <div key={m} className="flex items-center gap-3 p-3 glass rounded-2xl border border-gray-100 bg-white/60">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                    style={{background:info.color}}>{idx+1}</div>
                  <div className="flex items-center gap-2 flex-1">
                    <span style={{color:info.color}}>{METHOD_ICONS[m]}</span>
                    <span className="font-semibold text-sm text-gray-800">{info.label}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => moveUp(idx)} disabled={idx===0}
                      className="w-7 h-7 rounded-lg glass border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30">▲</button>
                    <button onClick={() => moveDown(idx)} disabled={idx===arr.length-1}
                      className="w-7 h-7 rounded-lg glass border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30">▼</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-card-bright">
        <h2 className="font-heading font-bold text-lg text-gray-900 mb-4">Additional Settings</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">OTP Length</label>
            <div className="flex gap-2">
              {([6,8] as const).map(n => (
                <button key={n} onClick={() => update({otpLength:n})}
                  className={cn("flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all",
                    config.otpLength===n ? "btn-crimson border-transparent" : "glass border-gray-200 text-gray-600 hover:border-red-200")}>
                  {n} digits
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">PIN Length</label>
            <div className="flex gap-2">
              {([4,6] as const).map(n => (
                <button key={n} onClick={() => update({pinLength:n})}
                  className={cn("flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all",
                    config.pinLength===n ? "btn-aurora border-transparent" : "glass border-gray-200 text-gray-600 hover:border-blue-200")}>
                  {n} digits
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Login Mode</label>
            <div className="flex gap-2">
              {(["universal","per-app"] as const).map(m => (
                <button key={m} onClick={() => update({loginMode:m})}
                  className={cn("flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all capitalize",
                    config.loginMode===m ? "btn-emerald border-transparent" : "glass border-gray-200 text-gray-600 hover:border-green-200")}>
                  {m==="universal"?"Universal":"Per-App"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Session Timeout</label>
            <select value={config.sessionTimeout} onChange={e=>update({sessionTimeout:Number(e.target.value)})}
              className="w-full glass rounded-xl px-3 py-2.5 text-sm text-gray-900 border border-gray-200 focus:outline-none">
              {[15,30,60,120,240].map(m=><option key={m} value={m}>{m} minutes</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Save */}
      <button onClick={saveAll}
        className={cn("w-full py-4 rounded-3xl font-bold text-base flex items-center justify-center gap-3 transition-all",
          saved ? "btn-emerald" : "btn-empire")}>
        {saved ? <><CheckCircle size={20} />Saved!</> : <><Save size={20} />Save Auth Configuration</>}
      </button>
    </div>
  );
}
