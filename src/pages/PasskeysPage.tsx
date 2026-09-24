// ─── Passkeys Page — Bright Theme ─────────────────────────────────────────
import { useState } from "react";
import { toast } from "sonner";
import { Fingerprint, Plus, Trash2, X, CheckCircle, ScanFace, Lock, KeyRound } from "lucide-react";
import { usePasskeys } from "@/hooks/useLocalData";
import { cn, formatRelativeTime } from "@/lib/utils";
import { PASSKEY_TYPES } from "@/constants";
import type { Passkey } from "@/types";

function AddModal({ onClose, onAdd }: { onClose:()=>void; onAdd:(d:Omit<Passkey,"id"|"createdAt"|"lastUsed">)=>void }) {
  const [form, setForm] = useState({ name:"", type:"biometric" as Passkey["type"], deviceName:"This Device", isActive:true, scope:"universal" as Passkey["scope"], linkedApps:[] as string[] });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Passkey name required"); return; }
    onAdd(form);
    toast.success(`${form.name} registered!`);
    onClose();
  }

  const typeColors = { biometric:"#dc2626", screenlock:"#8b5cf6", facial:"#f59e0b", hardware:"#10b981" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-lg" onClick={onClose}>
      <div className="glass-card rounded-3xl p-7 w-full max-w-md border border-white/80 shadow-card-float animate-slide-up" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-bold text-xl text-gray-900 flex items-center gap-2">
            <Fingerprint size={20} className="text-brand-crimson" /> Register Passkey
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Passkey Name</label>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="My Fingerprint, Face ID..."
              className="w-full glass rounded-2xl px-4 py-3 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-crimson/40 bg-white/80" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Passkey Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(PASSKEY_TYPES) as [Passkey["type"], typeof PASSKEY_TYPES["biometric"]][]).map(([k,v])=>(
                <button key={k} type="button" onClick={()=>setForm({...form,type:k})}
                  className={cn("p-3.5 rounded-2xl border text-left transition-all",
                    form.type===k ? "border-transparent shadow-sm" : "glass border-gray-200 hover:border-gray-300")}
                  style={form.type===k ? {background:`${typeColors[k]}12`,borderColor:`${typeColors[k]}30`}:{}}>
                  <p className="text-xs font-bold" style={form.type===k?{color:typeColors[k]}:{}}>{v.label}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Scope</label>
            <div className="grid grid-cols-2 gap-2">
              {(["universal","selected"] as const).map(s=>(
                <button key={s} type="button" onClick={()=>setForm({...form,scope:s})}
                  className={cn("py-2.5 rounded-xl border text-xs font-bold transition-all capitalize",
                    form.scope===s ? "btn-aurora border-transparent" : "glass border-gray-200 text-gray-600")}>
                  {s==="universal"?"Universal (All Apps)":"Selected Apps Only"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl glass border border-gray-200 text-gray-700 font-semibold text-sm">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-2xl btn-crimson text-sm">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PasskeysPage() {
  const { passkeys, add, update, remove } = usePasskeys();
  const [showAdd, setShowAdd] = useState(false);

  const typeColors: Record<string,string> = { biometric:"#dc2626", screenlock:"#8b5cf6", facial:"#f59e0b", hardware:"#10b981" };
  const typeIcons: Record<string,React.ReactNode> = {
    biometric: <Fingerprint size={22} />,
    screenlock: <Lock size={22} />,
    facial: <ScanFace size={22} />,
    hardware: <KeyRound size={22} />,
  };

  return (
    <div className="space-y-6 max-w-4xl page-enter">
      <div className="gradient-border rounded-3xl p-0.5">
        <div className="glass-card rounded-[calc(1.5rem-1px)] p-6 bg-gradient-to-br from-white to-red-50/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gradient-empire mb-1 flex items-center gap-3">
              <Fingerprint size={28} className="text-brand-crimson" /> Passkey Management
            </h1>
            <p className="text-sm text-gray-500">Biometric · Screen Lock · Facial Recognition · Hardware Keys</p>
          </div>
          <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 px-6 py-3 rounded-2xl btn-crimson text-sm flex-shrink-0">
            <Plus size={16} /> Register Passkey
          </button>
        </div>
      </div>

      {passkeys.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl border border-white/80">
          <Fingerprint size={56} className="text-gray-200 mx-auto mb-4" />
          <p className="font-heading font-bold text-gray-700 text-xl mb-2">No passkeys registered</p>
          <p className="text-gray-400 mb-6">Add your first biometric passkey for the strongest authentication</p>
          <button onClick={()=>setShowAdd(true)} className="btn-crimson px-8 py-3 rounded-2xl text-sm">+ Register First Passkey</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {passkeys.map(pk => {
            const color = typeColors[pk.type] || "#dc2626";
            return (
              <div key={pk.id} className="glass-card shimmer-card rounded-3xl p-5 border border-white/80 shadow-card-bright hover:shadow-card-glow hover:scale-[1.02] transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{background:`linear-gradient(135deg, ${color}, ${color}cc)`}}>
                    {typeIcons[pk.type]}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>update({...pk,isActive:!pk.isActive})}
                      className={cn("relative w-10 h-5 rounded-full transition-all", pk.isActive?"bg-brand-emerald":"bg-gray-200")}>
                      <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",pk.isActive?"translate-x-5":"translate-x-0.5")} />
                    </button>
                    <button onClick={()=>{remove(pk.id);toast.success("Passkey removed");}}
                      className="p-1.5 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <h3 className="font-heading font-bold text-base text-gray-900 mb-1">{pk.name}</h3>
                <p className="text-xs font-semibold mb-3" style={{color}}>{PASSKEY_TYPES[pk.type]?.label}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="glass rounded-xl p-2 bg-white/60 border border-gray-100">
                    <p className="text-gray-400">Scope</p>
                    <p className="font-semibold text-gray-700 capitalize mt-0.5">{pk.scope}</p>
                  </div>
                  <div className="glass rounded-xl p-2 bg-white/60 border border-gray-100">
                    <p className="text-gray-400">Last Used</p>
                    <p className="font-semibold text-gray-700 mt-0.5">{formatRelativeTime(pk.lastUsed)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className={cn("w-2 h-2 rounded-full", pk.isActive?"bg-emerald-500":"bg-gray-300")} />
                  <span className={cn("text-xs font-bold", pk.isActive?"text-emerald-600":"text-gray-400")}>{pk.isActive?"Active":"Inactive"}</span>
                </div>
              </div>
            );
          })}
          <button onClick={()=>setShowAdd(true)}
            className="glass rounded-3xl border-2 border-dashed border-gray-200 hover:border-brand-crimson/40 min-h-[200px] flex flex-col items-center justify-center gap-3 transition-all group hover:bg-red-50/20">
            <div className="w-12 h-12 rounded-2xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
              <Plus size={22} className="text-brand-crimson" />
            </div>
            <p className="text-sm font-semibold text-gray-400 group-hover:text-brand-crimson transition-colors">Add Passkey</p>
          </button>
        </div>
      )}

      {showAdd && <AddModal onClose={()=>setShowAdd(false)} onAdd={add} />}
    </div>
  );
}
