// ─── Smart PIN Pad + Encrypted Backup System ─────────────────────────────
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Lock, Unlock, Download, Upload, KeyRound, Shield, RefreshCw, Eye, EyeOff, AlertCircle, CheckCircle, Trash2, FileKey } from "lucide-react";
import { encryptBackup, decryptBackup, downloadBlob, buildBackupFilename } from "@/lib/backup";
import { cn } from "@/lib/utils";

// ─── Smart PIN Pad ────────────────────────────────────────────────────────
interface PinPadProps {
  length?: number;
  onComplete: (pin: string) => void;
  title?: string;
  subtitle?: string;
  color?: string;
}

export function SmartPinPad({ length = 4, onComplete, title = "Enter PIN", subtitle = "Use your Smart PIN", color = "#06b6d4" }: PinPadProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  useEffect(() => {
    if (digits.length === length) {
      const pin = digits.join("");
      onComplete(pin);
    }
  }, [digits, length, onComplete]);

  useEffect(() => {
    if (locked && lockTimer > 0) {
      const t = setInterval(() => setLockTimer(p => { if (p <= 1) { setLocked(false); clearInterval(t); return 0; } return p - 1; }), 1000);
      return () => clearInterval(t);
    }
  }, [locked, lockTimer]);

  function press(digit: string) {
    if (locked) return;
    if (digits.length >= length) return;
    setDigits(prev => [...prev, digit]);
  }

  function backspace() {
    setDigits(prev => prev.slice(0, -1));
  }

  function clear() {
    setDigits([]);
  }

  const keys = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div className="select-none">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center animate-float"
          style={{ background: `linear-gradient(135deg, ${color}20, ${color}40)`, border: `1px solid ${color}40` }}>
          {locked ? <Lock size={28} style={{ color }} /> : <Shield size={28} style={{ color }} />}
        </div>
        <h3 className="font-heading font-bold text-xl text-gray-900">{locked ? `Locked · ${lockTimer}s` : title}</h3>
        <p className="text-sm text-gray-500 mt-1">{locked ? "Too many attempts — wait" : subtitle}</p>
      </div>

      {/* Digit Display */}
      <div className="flex justify-center gap-3 mb-8">
        {Array.from({length}).map((_, i) => (
          <div key={i} className={cn(
            "w-12 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-200",
            shake ? "animate-[wiggle_0.3s_ease-in-out]" : "",
            i < digits.length
              ? "border-opacity-100 shadow-sm scale-105"
              : "border-gray-200 bg-white/60"
          )}
            style={i < digits.length ? { borderColor: color, background: `${color}12` } : {}}>
            {i < digits.length ? (
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            ) : null}
          </div>
        ))}
      </div>

      {/* Keypad */}
      <div className={cn("grid grid-cols-3 gap-3", shake && "animate-[wiggle_0.3s_ease-in-out]")}>
        {keys.map((k, i) => {
          if (k === "") return <div key={i} />;
          return (
            <button key={i}
              onClick={() => k === "⌫" ? backspace() : press(k)}
              disabled={locked}
              className={cn(
                "pin-key h-16 rounded-2xl font-heading font-bold text-xl text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed",
                k === "⌫" ? "text-base text-gray-500" : ""
              )}>
              {k}
            </button>
          );
        })}
      </div>

      {digits.length > 0 && (
        <button onClick={clear} className="mt-4 w-full py-2 text-xs text-gray-400 hover:text-red-500 transition-colors">
          Clear
        </button>
      )}

      {/* Strength indicator */}
      <div className="mt-4 h-1 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${(digits.length / length) * 100}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 8px ${color}60`
          }} />
      </div>
      <p className="text-center text-xs text-gray-400 mt-1">{digits.length}/{length} digits</p>
    </div>
  );
}

// ─── Backup Manager ───────────────────────────────────────────────────────
interface BackupRecord {
  id: string;
  filename: string;
  createdAt: string;
  size: number;
  encrypted: boolean;
}

const BACKUPS_KEY = "ae_backups_meta";
function loadBackups(): BackupRecord[] {
  try { return JSON.parse(localStorage.getItem(BACKUPS_KEY) || "[]"); } catch { return []; }
}
function saveBackupRecord(r: BackupRecord) {
  const all = loadBackups();
  localStorage.setItem(BACKUPS_KEY, JSON.stringify([r, ...all]));
}

function ExportModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"pin" | "confirm" | "done">("pin");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleExport(enteredPin: string) {
    setPin(enteredPin);
    setStep("confirm");
  }

  async function confirmExport() {
    setLoading(true);
    const payload: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("ae_")) payload[key] = localStorage.getItem(key);
    }
    const blob = await encryptBackup(payload, pin);
    const filename = buildBackupFilename();
    downloadBlob(blob, filename);
    const record: BackupRecord = { id: Date.now().toString(), filename, createdAt: new Date().toISOString(), size: blob.size, encrypted: true };
    saveBackupRecord(record);
    localStorage.setItem("ae_last_backup", new Date().toISOString());
    setLoading(false);
    setStep("done");
    toast.success("Encrypted backup downloaded!", { description: "Keep it safe — only you know the PIN" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-lg" onClick={onClose}>
      <div className="glass-card rounded-3xl p-8 w-full max-w-sm border border-white/80 shadow-card-float animate-slide-up" onClick={e => e.stopPropagation()}>
        {step === "pin" && (
          <SmartPinPad length={4} onComplete={handleExport} title="Set Backup PIN"
            subtitle="This PIN protects your backup" color="#dc2626" />
        )}
        {step === "confirm" && (
          <div className="text-center">
            <FileKey size={48} className="text-brand-crimson mx-auto mb-4" />
            <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">Ready to Export</h3>
            <p className="text-sm text-gray-500 mb-6">AES-256-GCM encrypted · PIN-protected · Device-local</p>
            <div className="glass rounded-xl p-4 mb-6 bg-yellow-50/80 border border-yellow-200">
              <p className="text-xs text-yellow-800 font-semibold flex items-center gap-2">
                <AlertCircle size={14} />Remember your PIN! Without it, backup is unrecoverable.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep("pin")} className="flex-1 py-3 rounded-2xl glass border border-gray-200 text-gray-700 font-semibold text-sm">Back</button>
              <button onClick={confirmExport} disabled={loading}
                className="flex-1 py-3 rounded-2xl btn-crimson text-sm flex items-center justify-center gap-2">
                {loading ? <><RefreshCw size={14} className="animate-spin" />Encrypting…</> : <><Download size={14} />Download</>}
              </button>
            </div>
          </div>
        )}
        {step === "done" && (
          <div className="text-center">
            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
            <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">Backup Complete!</h3>
            <p className="text-sm text-gray-500 mb-6">Your encrypted .aeb file has been downloaded</p>
            <button onClick={onClose} className="w-full py-3 rounded-2xl btn-emerald text-sm">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ImportModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"file" | "pin" | "done">("file");
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handlePin(pin: string) {
    if (!file) return;
    setLoading(true);
    const data = await decryptBackup(file, pin).catch(err => {
      toast.error(err.message);
      setLoading(false);
      return null;
    });
    if (data) {
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === "string") localStorage.setItem(k, v);
      }
      setStep("done");
      toast.success("Backup restored successfully!");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-lg" onClick={onClose}>
      <div className="glass-card rounded-3xl p-8 w-full max-w-sm border border-white/80 shadow-card-float animate-slide-up" onClick={e => e.stopPropagation()}>
        {step === "file" && (
          <div>
            <div className="text-center mb-6">
              <Upload size={40} className="text-brand-aurora mx-auto mb-3" />
              <h3 className="font-heading font-bold text-xl text-gray-900">Import Backup</h3>
              <p className="text-sm text-gray-500 mt-1">Select your .aeb encrypted backup file</p>
            </div>
            <input ref={fileRef} type="file" accept=".aeb" className="hidden"
              onChange={e => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setStep("pin"); } }} />
            <button onClick={() => fileRef.current?.click()}
              className="w-full py-8 rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-aurora/40 transition-colors text-center mb-4 hover:bg-cyan-50/30 group">
              <FileKey size={32} className="text-gray-300 group-hover:text-brand-aurora mx-auto mb-2 transition-colors" />
              <p className="text-sm text-gray-500 group-hover:text-brand-aurora">Click to select .aeb file</p>
            </button>
            <button onClick={onClose} className="w-full py-3 rounded-2xl glass border border-gray-200 text-gray-600 text-sm font-semibold">Cancel</button>
          </div>
        )}
        {step === "pin" && (
          <SmartPinPad length={4} onComplete={handlePin} title="Enter Backup PIN"
            subtitle={`Decrypt: ${file?.name}`} color="#06b6d4" />
        )}
        {step === "done" && (
          <div className="text-center">
            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
            <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">Restore Complete!</h3>
            <p className="text-sm text-gray-500 mb-6">All data has been restored from backup</p>
            <button onClick={() => window.location.reload()} className="w-full py-3 rounded-2xl btn-emerald text-sm">Refresh App</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Backup & PIN Page ───────────────────────────────────────────────
export default function BackupPage() {
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [backups, setBackups] = useState<BackupRecord[]>(loadBackups);
  const [showPinDemo, setShowPinDemo] = useState(false);
  const [demoResult, setDemoResult] = useState<string | null>(null);

  function refreshBackups() {
    setBackups(loadBackups());
  }

  function handlePinDemo(pin: string) {
    setDemoResult(pin);
    toast.success(`PIN entered: ${pin.replace(/./g, "•")}`);
  }

  const lastBackup = localStorage.getItem("ae_last_backup");

  return (
    <div className="space-y-6 max-w-4xl page-enter">
      {/* Header */}
      <div className="gradient-border rounded-3xl p-0.5">
        <div className="glass-card rounded-[calc(1.5rem-1px)] p-6 md:p-8 bg-gradient-to-br from-white to-violet-50/30">
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gradient-empire mb-2">Backup & PIN Manager</h1>
          <p className="text-sm text-gray-500">AES-256-GCM encrypted backups · PIN-protected · Offline-first · Zero cloud exposure</p>
        </div>
      </div>

      {/* Backup Actions */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="glass-card rounded-3xl p-6 border border-white/80 bg-gradient-to-br from-red-50/40 to-rose-50/20">
          <div className="w-12 h-12 rounded-2xl btn-crimson flex items-center justify-center mb-4 shadow-glow-crimson">
            <Download size={22} className="text-white" />
          </div>
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-1">Export Backup</h2>
          <p className="text-sm text-gray-500 mb-4">Create an encrypted .aeb backup file protected by your chosen PIN</p>
          <div className="space-y-2 mb-5">
            {["AES-256-GCM encryption","PBKDF2 key derivation (310,000 rounds)","Works offline — no server involved","Import on any device with PIN"].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" /> {f}
              </div>
            ))}
          </div>
          <button onClick={() => setShowExport(true)}
            className="w-full py-3 rounded-2xl btn-crimson text-sm flex items-center justify-center gap-2">
            <Download size={16} /> Create Encrypted Backup
          </button>
          {lastBackup && <p className="text-xs text-gray-400 mt-2 text-center">Last backup: {new Date(lastBackup).toLocaleDateString()}</p>}
        </div>

        <div className="glass-card rounded-3xl p-6 border border-white/80 bg-gradient-to-br from-cyan-50/40 to-sky-50/20">
          <div className="w-12 h-12 rounded-2xl btn-aurora flex items-center justify-center mb-4 shadow-glow-aurora">
            <Upload size={22} className="text-white" />
          </div>
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-1">Import Backup</h2>
          <p className="text-sm text-gray-500 mb-4">Restore your data from a .aeb encrypted backup file with your PIN</p>
          <div className="space-y-2 mb-5">
            {["Select your .aeb file","Enter the 4-digit backup PIN","All data restored instantly","No data sent to any server"].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle size={12} className="text-brand-aurora flex-shrink-0" /> {f}
              </div>
            ))}
          </div>
          <button onClick={() => setShowImport(true)}
            className="w-full py-3 rounded-2xl btn-aurora text-sm flex items-center justify-center gap-2">
            <Upload size={16} /> Restore from Backup
          </button>
        </div>
      </div>

      {/* Smart PIN Demo */}
      <div className="glass-card rounded-3xl p-6 border border-white/80">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg text-gray-900 flex items-center gap-2">
            <KeyRound size={20} className="text-brand-violet" /> Smart PIN Pad Demo
          </h2>
          <button onClick={() => { setShowPinDemo(!showPinDemo); setDemoResult(null); }}
            className="text-sm text-brand-aurora hover:underline">{showPinDemo ? "Hide" : "Try PIN Pad"}</button>
        </div>
        {showPinDemo && (
          <div className="max-w-xs mx-auto">
            <SmartPinPad length={4} onComplete={handlePinDemo}
              title="Test Smart PIN" subtitle="Experience the PIN pad" color="#8b5cf6" />
            {demoResult && (
              <div className="mt-4 text-center glass rounded-xl p-3 bg-violet-50/50 border border-violet-100">
                <p className="text-sm font-semibold text-violet-700">
                  PIN Accepted! <span className="font-mono tracking-widest">{demoResult.replace(/./g,"•")}</span>
                </p>
              </div>
            )}
          </div>
        )}
        {!showPinDemo && (
          <p className="text-sm text-gray-400">Click "Try PIN Pad" to experience the haptic-style smart PIN entry system with animated feedback</p>
        )}
      </div>

      {/* Backup History */}
      <div className="glass-card rounded-3xl p-6 border border-white/80">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg text-gray-900 flex items-center gap-2">
            <Shield size={20} className="text-brand-emerald" /> Backup History
          </h2>
          <button onClick={refreshBackups} className="text-sm text-brand-aurora hover:underline flex items-center gap-1">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
        {backups.length === 0 ? (
          <div className="text-center py-8">
            <Lock size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No backups created yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map(b => (
              <div key={b.id} className="flex items-center justify-between p-4 glass rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-crimson to-brand-violet flex items-center justify-center">
                    <FileKey size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-mono text-xs font-semibold text-gray-800">{b.filename}</p>
                    <p className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleString()} · {(b.size/1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-semibold">AES-256</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showExport && <ExportModal onClose={() => { setShowExport(false); refreshBackups(); }} />}
      {showImport && <ImportModal onClose={() => { setShowImport(false); refreshBackups(); }} />}
    </div>
  );
}
