// ─── TOTP Generator Page ─────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Copy, Trash2, QrCode, RefreshCw, Shield, Key, Eye, EyeOff, Download, Check } from "lucide-react";
import {
  computeTOTP, generateTOTPSecret, verifyTOTP, getTOTPRemainingSeconds,
  buildTOTPUri, getQRCodeURL, generateRecoveryCodes
} from "@/lib/totp";
import { cn } from "@/lib/utils";

interface TOTPEntry {
  id: string;
  label: string;
  issuer: string;
  secret: string;
  digits: number;
  period: number;
  color: string;
}

const COLORS = ["#dc2626","#06b6d4","#10b981","#8b5cf6","#f59e0b","#d946ef","#f43f5e","#6366f1"];

const DEMO_ENTRIES: TOTPEntry[] = [
  { id: "t1", label: "admin@uniorbi.com", issuer: "UniOrbi", secret: generateTOTPSecret(), digits: 6, period: 30, color: "#dc2626" },
  { id: "t2", label: "dev@github.com",    issuer: "GitHub",   secret: generateTOTPSecret(), digits: 6, period: 30, color: "#1e1b4b" },
];

const STORAGE_KEY = "ae_totp_entries";

function loadEntries(): TOTPEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEMO_ENTRIES;
  } catch { return DEMO_ENTRIES; }
}
function saveEntries(entries: TOTPEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ── Single TOTP Card ──────────────────────────────────────────────────────
function TOTPCard({ entry, onDelete }: { entry: TOTPEntry; onDelete: (id: string) => void }) {
  const [code, setCode] = useState("------");
  const [remaining, setRemaining] = useState(30);
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    let alive = true;
    async function tick() {
      if (!alive) return;
      const c = await computeTOTP(entry.secret, Date.now(), entry.digits, entry.period);
      if (alive) { setCode(c); setRemaining(getTOTPRemainingSeconds(entry.period)); }
    }
    tick();
    const iv = setInterval(tick, 1000);
    return () => { alive = false; clearInterval(iv); };
  }, [entry]);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("TOTP code copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  const progress = (remaining / entry.period) * 100;
  const urgency = remaining <= 5;
  const circumference = 2 * Math.PI * 16;

  return (
    <div className={cn(
      "glass-card shimmer-card rounded-3xl p-5 border transition-all hover:shadow-lg group",
      urgency ? "border-red-300 animate-[warningFlash_0.8s_ease-in-out_infinite]" : "border-white/70"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-sm"
            style={{ background: `linear-gradient(135deg, ${entry.color}, ${entry.color}cc)` }}>
            {entry.issuer.charAt(0)}
          </div>
          <div>
            <p className="font-heading font-bold text-sm text-gray-900">{entry.issuer}</p>
            <p className="text-xs text-gray-500 truncate max-w-[120px]">{entry.label}</p>
          </div>
        </div>
        {/* Countdown ring */}
        <div className="relative w-10 h-10 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
            <circle cx="18" cy="18" r="16" fill="none"
              stroke={urgency ? "#dc2626" : entry.color}
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-[10px] font-bold tabular-nums", urgency ? "text-red-500" : "text-gray-600")}>{remaining}</span>
          </div>
        </div>
      </div>

      {/* Code Display */}
      <div
        onClick={copyCode}
        className={cn(
          "relative flex items-center justify-between px-5 py-3.5 rounded-2xl cursor-pointer transition-all mb-3",
          urgency
            ? "bg-red-50 border border-red-200"
            : "bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-aurora-200"
        )}
      >
        <span className="font-mono font-bold text-2xl tracking-[0.3em] text-gray-900"
          style={{ color: urgency ? "#dc2626" : entry.color }}>
          {code.match(/.{1,3}/g)?.join(" ")}
        </span>
        <div className="flex items-center gap-1.5">
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-400" />}
        </div>
        {copied && <div className="absolute inset-0 bg-green-400/10 rounded-2xl border border-green-300" />}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowSecret(!showSecret)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          {showSecret ? <EyeOff size={12} /> : <Eye size={12} />}
          {showSecret ? entry.secret : "••••••••••••"}
        </button>
        <button onClick={() => onDelete(entry.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Add TOTP Modal ────────────────────────────────────────────────────────
function AddTOTPModal({ onClose, onAdd }: { onClose: () => void; onAdd: (e: TOTPEntry) => void }) {
  const [form, setForm] = useState({ label: "", issuer: "", secret: generateTOTPSecret(), color: COLORS[0] });
  const [qrVisible, setQrVisible] = useState(false);
  const [manualSecret, setManualSecret] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);

  const qrUri = buildTOTPUri(form.secret, form.label || "Account", form.issuer || "AuthEmpire");
  const qrUrl = getQRCodeURL(qrUri, 200);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label.trim()) { toast.error("Account label required"); return; }
    onAdd({ id: `t${Date.now()}`, ...form, digits: 6, period: 30 });
    toast.success("TOTP authenticator added!");
    onClose();
  }

  function generateRecovery() {
    setCodes(generateRecoveryCodes(8));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-lg" onClick={onClose}>
      <div className="glass-card rounded-3xl p-7 w-full max-w-lg border border-white/80 shadow-card-float animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-5 flex items-center gap-2">
          <Shield size={20} className="text-brand-crimson" /> Add Authenticator
        </h2>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Account / Email *</label>
              <input value={form.label} onChange={e => setForm({...form, label: e.target.value})}
                placeholder="user@example.com"
                className="w-full glass rounded-xl px-3 py-2.5 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-aurora/40" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Service Name</label>
              <input value={form.issuer} onChange={e => setForm({...form, issuer: e.target.value})}
                placeholder="GitHub, Google..."
                className="w-full glass rounded-xl px-3 py-2.5 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-aurora/40" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-600">Secret Key</label>
              <button type="button" onClick={() => setForm({...form, secret: generateTOTPSecret()})}
                className="text-xs text-brand-aurora hover:underline flex items-center gap-1">
                <RefreshCw size={10} /> Regenerate
              </button>
            </div>
            <div className="flex gap-2">
              <input type={manualSecret ? "text" : "password"} value={form.secret}
                onChange={e => setForm({...form, secret: e.target.value.toUpperCase()})}
                className="flex-1 glass rounded-xl px-3 py-2.5 text-sm font-mono text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-aurora/40" />
              <button type="button" onClick={() => setManualSecret(!manualSecret)}
                className="p-2.5 glass rounded-xl border border-gray-200 text-gray-500 hover:text-gray-800">
                {manualSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Color Tag</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm({...form, color: c})}
                  className={cn("w-7 h-7 rounded-full transition-all", form.color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "")}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* QR Code */}
          <div className="glass rounded-2xl p-4 border border-gray-100">
            <button type="button" onClick={() => setQrVisible(!qrVisible)}
              className="flex items-center gap-2 text-sm font-semibold text-brand-aurora w-full">
              <QrCode size={16} /> {qrVisible ? "Hide" : "Show"} QR Code for Authenticator Apps
            </button>
            {qrVisible && (
              <div className="mt-3 flex flex-col items-center gap-3">
                <img src={qrUrl} alt="TOTP QR" className="w-48 h-48 rounded-xl border border-gray-200 bg-white p-2" />
                <p className="text-xs text-gray-500 text-center">Scan with Google Authenticator, Authy, or any TOTP app</p>
              </div>
            )}
          </div>

          {/* Recovery Codes */}
          <div className="glass rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                <Key size={14} className="text-brand-crimson" /> Recovery Codes (GitHub-style)
              </span>
              <button type="button" onClick={generateRecovery}
                className="text-xs text-brand-crimson hover:underline">Generate</button>
            </div>
            {codes.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {codes.map((c, i) => (
                  <div key={i} className="font-mono text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700">{c}</div>
                ))}
              </div>
            )}
            {codes.length > 0 && (
              <button type="button"
                onClick={() => { const t = codes.join("\n"); navigator.clipboard.writeText(t); toast.success("Codes copied!"); }}
                className="mt-2 text-xs text-brand-aurora hover:underline flex items-center gap-1">
                <Copy size={10} /> Copy all codes
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl glass border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit"
              className="flex-1 py-3 rounded-2xl btn-crimson text-sm rounded-2xl">Add Authenticator</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 2FA Verification Dialog ───────────────────────────────────────────────
function TwoFADialog({ secret, onVerify, onClose }: { secret: string; onVerify: (ok: boolean) => void; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const ok = await verifyTOTP(secret, input.replace(/\s/g, ""));
    setLoading(false);
    if (ok) { toast.success("2FA Verified — Access Granted!"); onVerify(true); }
    else { toast.error("Invalid code. Try again."); setInput(""); onVerify(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-lg" onClick={onClose}>
      <div className="glass-card rounded-3xl p-8 w-full max-w-sm border border-white/80 shadow-card-float animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-crimson to-brand-violet flex items-center justify-center mx-auto mb-4 animate-float">
            <Shield size={28} className="text-white" />
          </div>
          <h2 className="font-heading font-bold text-xl text-gray-900">2FA Verification</h2>
          <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code from your authenticator</p>
        </div>
        <form onSubmit={handleVerify}>
          <input
            type="text" inputMode="numeric" maxLength={6} value={input}
            onChange={e => setInput(e.target.value.replace(/\D/g,"").slice(0,6))}
            autoFocus
            placeholder="000 000"
            className="w-full text-center text-3xl font-mono tracking-[0.5em] font-bold py-4 rounded-2xl border-2 border-gray-200 focus:border-brand-aurora focus:outline-none bg-white/80 text-gray-900 mb-4"
          />
          <button type="submit" disabled={input.length < 6 || loading}
            className="w-full py-3.5 rounded-2xl btn-crimson disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Verifying…" : "Verify Code"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function TOTPPage() {
  const [entries, setEntries] = useState<TOTPEntry[]>(loadEntries);
  const [showAdd, setShowAdd] = useState(false);
  const [demo2FA, setDemo2FA] = useState<string | null>(null);

  function handleAdd(e: TOTPEntry) {
    const updated = [...entries, e];
    setEntries(updated);
    saveEntries(updated);
  }
  function handleDelete(id: string) {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
    toast.success("Authenticator removed");
  }

  return (
    <div className="space-y-6 max-w-5xl page-enter">
      {/* Header */}
      <div className="gradient-border rounded-3xl p-0.5 shadow-glow-aurora">
        <div className="glass-card rounded-[calc(1.5rem-1px)] p-6 md:p-8 bg-gradient-to-br from-white to-blue-50/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="status-dot-active" />
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Live TOTP Engine Active</span>
              </div>
              <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gradient-empire mb-1">
                TOTP Authenticator
              </h1>
              <p className="text-sm text-gray-500">Real-time codes refresh every 30 seconds — click any code to copy</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => entries.length > 0 && setDemo2FA(entries[0].secret)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-aurora text-sm">
                <Shield size={16} /> Test 2FA
              </button>
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-crimson text-sm">
                <Plus size={16} /> Add Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="glass rounded-2xl p-4 border border-aurora-200/60 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="flex items-start gap-3">
          <QrCode size={18} className="text-brand-aurora mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800">How to set up 2FA like GitHub</p>
            <p className="text-xs text-gray-500 mt-0.5">
              1. Add an account above → 2. Scan the QR code with Google Authenticator / Authy → 3. Enter the live 6-digit code to verify → Done! Every login requires this code.
            </p>
          </div>
        </div>
      </div>

      {/* TOTP Grid */}
      {entries.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {entries.map(e => <TOTPCard key={e.id} entry={e} onDelete={handleDelete} />)}
          <button onClick={() => setShowAdd(true)}
            className="glass rounded-3xl border-2 border-dashed border-gray-200 hover:border-brand-crimson/40 transition-all flex flex-col items-center justify-center gap-3 min-h-[200px] group hover:bg-red-50/30">
            <div className="w-12 h-12 rounded-2xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
              <Plus size={22} className="text-brand-crimson" />
            </div>
            <p className="text-sm font-semibold text-gray-400 group-hover:text-brand-crimson transition-colors">Add Authenticator</p>
          </button>
        </div>
      ) : (
        <div className="text-center py-20 glass-card rounded-3xl border border-white/80">
          <Shield size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="font-heading font-bold text-gray-700 text-lg mb-2">No authenticators yet</p>
          <p className="text-gray-400 text-sm mb-6">Add your first TOTP authenticator to enable 2FA</p>
          <button onClick={() => setShowAdd(true)} className="btn-crimson px-8 py-3 rounded-2xl text-sm">
            + Add First Authenticator
          </button>
        </div>
      )}

      {/* 2FA Auth Methods Summary */}
      <div className="glass-card rounded-3xl p-6 border border-white/80">
        <h2 className="font-heading font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Key size={20} className="text-brand-violet" /> Supported 2FA Methods
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "TOTP App", icon: "📱", desc: "Google Auth, Authy", active: true, color: "#dc2626" },
            { label: "SMS OTP", icon: "💬", desc: "Via phone number", active: false, color: "#06b6d4" },
            { label: "Email OTP", icon: "📧", desc: "One-time email link", active: true, color: "#10b981" },
            { label: "Hardware Key", icon: "🔑", desc: "YubiKey / FIDO2", active: false, color: "#8b5cf6" },
          ].map(m => (
            <div key={m.label} className={cn(
              "rounded-2xl p-4 border transition-all",
              m.active ? "bg-white/80 border-gray-200 shadow-sm" : "bg-gray-50/50 border-gray-100"
            )}>
              <div className="text-2xl mb-2">{m.icon}</div>
              <p className="font-semibold text-sm text-gray-800">{m.label}</p>
              <p className="text-xs text-gray-400">{m.desc}</p>
              <div className={cn("mt-2 flex items-center gap-1 text-xs font-semibold",
                m.active ? "text-emerald-600" : "text-gray-400")}>
                <div className={m.active ? "status-dot-active" : "status-dot-inactive"} />
                {m.active ? "Active" : "Available"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAdd && <AddTOTPModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      {demo2FA && <TwoFADialog secret={demo2FA} onVerify={() => setDemo2FA(null)} onClose={() => setDemo2FA(null)} />}
    </div>
  );
}
