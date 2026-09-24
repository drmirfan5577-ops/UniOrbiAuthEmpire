// ─── Password Manager — Bright Theme ─────────────────────────────────────
import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Plus, Trash2, X, Eye, EyeOff, Copy, Shield } from "lucide-react";
import { useCredentials } from "@/hooks/useLocalData";
import { cn, formatRelativeTime, calculatePasswordStrength } from "@/lib/utils";
import type { StoredCredential } from "@/types";

const STRENGTH_CONFIG = {
  weak:    { label:"Weak",    color:"#dc2626", bg:"from-red-50 to-rose-50",     w:"20%" },
  medium:  { label:"Medium",  color:"#f59e0b", bg:"from-amber-50 to-yellow-50", w:"50%" },
  strong:  { label:"Strong",  color:"#10b981", bg:"from-emerald-50 to-green-50",w:"75%" },
  fortress:{ label:"Fortress",color:"#06b6d4", bg:"from-cyan-50 to-sky-50",     w:"100%" },
};

function AddModal({ onClose, onAdd }: { onClose:()=>void; onAdd:(d:Omit<StoredCredential,"id"|"createdAt"|"updatedAt">)=>void }) {
  const [form, setForm] = useState({ appId:"", appName:"", username:"", passwordHint:"", recoveryEmail:"", hasBackupFile:false, pinProtected:false, strength:"medium" as StoredCredential["strength"] });
  const [showPw, setShowPw] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.appName.trim() || !form.username.trim()) { toast.error("App name and username required"); return; }
    const strength = calculatePasswordStrength(form.passwordHint);
    onAdd({ ...form, appId: form.appId || `app-${Date.now()}`, strength });
    toast.success("Credential saved securely!");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-lg" onClick={onClose}>
      <div className="glass-card rounded-3xl p-7 w-full max-w-lg border border-white/80 shadow-card-float animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-bold text-xl text-gray-900 flex items-center gap-2">
            <KeyRound size={20} className="text-brand-violet" /> Add Credential
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">App / Site *</label>
              <input value={form.appName} onChange={e=>setForm({...form,appName:e.target.value})} placeholder="Gmail, GitHub..."
                className="w-full glass rounded-2xl px-4 py-3 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-violet/40 bg-white/80" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Username / Email *</label>
              <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="user@example.com"
                className="w-full glass rounded-2xl px-4 py-3 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-violet/40 bg-white/80" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Password Hint</label>
            <div className="flex gap-2">
              <input type={showPw?"text":"password"} value={form.passwordHint} onChange={e=>setForm({...form,passwordHint:e.target.value})}
                placeholder="Password or hint..."
                className="flex-1 glass rounded-2xl px-4 py-3 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-violet/40 bg-white/80" />
              <button type="button" onClick={()=>setShowPw(!showPw)} className="p-3 glass rounded-2xl border border-gray-200 text-gray-400 hover:text-gray-700">
                {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
              </button>
            </div>
            {form.passwordHint && (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{width:STRENGTH_CONFIG[calculatePasswordStrength(form.passwordHint)].w, background:STRENGTH_CONFIG[calculatePasswordStrength(form.passwordHint)].color}} />
                </div>
                <p className="text-xs mt-1 font-semibold" style={{color:STRENGTH_CONFIG[calculatePasswordStrength(form.passwordHint)].color}}>
                  {STRENGTH_CONFIG[calculatePasswordStrength(form.passwordHint)].label}
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Recovery Email</label>
            <input type="email" value={form.recoveryEmail} onChange={e=>setForm({...form,recoveryEmail:e.target.value})} placeholder="backup@email.com"
              className="w-full glass rounded-2xl px-4 py-3 text-sm text-gray-900 border border-gray-200 focus:outline-none bg-white/80" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {key:"pinProtected",label:"PIN Protected",icon:"🔐"},
              {key:"hasBackupFile",label:"Backup File",icon:"📁"},
            ].map(opt=>(
              <button key={opt.key} type="button"
                onClick={()=>setForm({...form,[opt.key]:!form[opt.key as keyof typeof form]})}
                className={cn("p-3 rounded-2xl border text-sm font-semibold flex items-center gap-2 transition-all",
                  form[opt.key as keyof typeof form] ? "btn-aurora border-transparent" : "glass border-gray-200 text-gray-600 hover:border-blue-200")}>
                <span>{opt.icon}</span>{opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl glass border border-gray-200 text-gray-700 font-semibold text-sm">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-2xl btn-violet text-sm" style={{background:"linear-gradient(135deg,#8b5cf6,#a78bfa)",color:"white",fontWeight:700}}>Save Credential</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PasswordManagerPage() {
  const { credentials, add, remove } = useCredentials();
  const [showAdd, setShowAdd] = useState(false);
  const [showPw, setShowPw] = useState<string[]>([]);

  function togglePw(id: string) {
    setShowPw(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  return (
    <div className="space-y-6 max-w-4xl page-enter">
      <div className="gradient-border rounded-3xl p-0.5">
        <div className="glass-card rounded-[calc(1.5rem-1px)] p-6 bg-gradient-to-br from-white to-violet-50/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gradient-empire mb-1 flex items-center gap-3">
              <KeyRound size={28} className="text-brand-violet" /> Password Manager
            </h1>
            <p className="text-sm text-gray-500">Encrypted credentials · Device-local · PIN protected · Zero server exposure</p>
          </div>
          <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm flex-shrink-0 text-white font-bold"
            style={{background:"linear-gradient(135deg,#8b5cf6,#a78bfa)",boxShadow:"0 4px 16px rgba(139,92,246,0.35)"}}>
            <Plus size={16} /> Add Credential
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {credentials.map(c => {
          const s = STRENGTH_CONFIG[c.strength];
          return (
            <div key={c.id} className={`glass-card shimmer-card rounded-3xl p-5 border border-white/80 bg-gradient-to-br ${s.bg} shadow-card-bright hover:shadow-card-glow transition-all`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-sm"
                    style={{background:`linear-gradient(135deg, ${s.color}, ${s.color}cc)`}}>
                    {c.appName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-gray-900">{c.appName}</h3>
                    <p className="text-xs text-gray-500">{c.username}</p>
                  </div>
                </div>
                <button onClick={()=>{remove(c.id);toast.success("Credential removed");}}
                  className="p-1.5 rounded-xl hover:bg-red-50 text-gray-200 hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Password hint */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 glass rounded-xl px-3 py-2 font-mono text-sm border border-gray-100 bg-white/60">
                  {showPw.includes(c.id) ? c.passwordHint : "•".repeat(12)}
                </div>
                <button onClick={()=>togglePw(c.id)} className="p-2 glass rounded-xl border border-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                  {showPw.includes(c.id)?<EyeOff size={14}/>:<Eye size={14}/>}
                </button>
                <button onClick={()=>{navigator.clipboard.writeText(c.passwordHint);toast.success("Copied!");}}
                  className="p-2 glass rounded-xl border border-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                  <Copy size={14}/>
                </button>
              </div>

              {/* Strength bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full" style={{width:s.w,background:s.color}} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold" style={{color:s.color}}>{s.label}</span>
                <div className="flex items-center gap-2 text-gray-400">
                  {c.pinProtected && <span title="PIN protected">🔐</span>}
                  {c.hasBackupFile && <span title="Backup file exists">📁</span>}
                  <span>{formatRelativeTime(c.updatedAt)}</span>
                </div>
              </div>
            </div>
          );
        })}

        <button onClick={()=>setShowAdd(true)}
          className="glass rounded-3xl border-2 border-dashed border-gray-200 hover:border-violet-300/60 min-h-[180px] flex flex-col items-center justify-center gap-3 transition-all group hover:bg-violet-50/20">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
            <Plus size={22} className="text-brand-violet" />
          </div>
          <p className="text-sm font-semibold text-gray-400 group-hover:text-brand-violet transition-colors">Add Credential</p>
        </button>
      </div>

      {showAdd && <AddModal onClose={()=>setShowAdd(false)} onAdd={add} />}
    </div>
  );
}
