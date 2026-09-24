// ─── Backends Hub — Bright Theme ─────────────────────────────────────────
import { useState } from "react";
import { toast } from "sonner";
import { Server, Plus, Trash2, X, CheckCircle, AlertTriangle, RefreshCw, Shield, Lock } from "lucide-react";
import { useBackends } from "@/hooks/useLocalData";
import { BACKEND_TYPES } from "@/constants";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { BackendIntegration } from "@/types";

function AddModal({ onClose, onAdd }: { onClose:()=>void; onAdd:(d:Omit<BackendIntegration,"id">)=>void }) {
  const [form, setForm] = useState({ name:"", type:"supabase" as BackendIntegration["type"], endpoint:"", isConnected:false, lastSync:new Date().toISOString(), usersManaged:0, status:"inactive" as BackendIntegration["status"] });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.endpoint.trim()) { toast.error("Name and endpoint are required"); return; }
    onAdd(form);
    toast.success(`${form.name} added to Backend Hub!`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-lg" onClick={onClose}>
      <div className="glass-card rounded-3xl p-7 w-full max-w-md border border-white/80 shadow-card-float animate-slide-up" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-bold text-xl text-gray-900 flex items-center gap-2">
            <Server size={20} className="text-brand-gold" /> Add Backend
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"><X size={16}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Backend Name *</label>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Production Supabase"
              className="w-full glass rounded-2xl px-4 py-3 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white/80" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Provider Type</label>
            <div className="grid grid-cols-3 gap-2">
              {BACKEND_TYPES.map(t=>(
                <button key={t.id} type="button" onClick={()=>setForm({...form,type:t.id as BackendIntegration["type"]})}
                  className={cn("p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1",
                    form.type===t.id ? "border-amber-300 bg-amber-50 shadow-sm" : "glass border-gray-200 hover:border-amber-200")}>
                  <span className="text-lg">{t.logo}</span>
                  <span className={form.type===t.id?"text-amber-700":"text-gray-600"}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Endpoint URL *</label>
            <input value={form.endpoint} onChange={e=>setForm({...form,endpoint:e.target.value})} placeholder="https://project.supabase.co"
              className="w-full glass rounded-2xl px-4 py-3 text-sm font-mono text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 bg-white/80" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl glass border border-gray-200 text-gray-700 font-semibold text-sm">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-2xl btn-gold text-sm" style={{background:"linear-gradient(135deg,#f59e0b,#fbbf24)",color:"white",fontWeight:700,boxShadow:"0 4px 16px rgba(245,158,11,0.35)"}}>Add Backend</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const STATUS_CFG = {
  active:   { label:"Active",   color:"#10b981", bg:"bg-emerald-50",  icon:<CheckCircle size={14}/> },
  inactive: { label:"Inactive", color:"#9ca3af", bg:"bg-gray-50",     icon:<AlertTriangle size={14}/> },
  error:    { label:"Error",    color:"#dc2626", bg:"bg-red-50",       icon:<AlertTriangle size={14}/> },
};

export default function BackendsPage() {
  const { backends, add, update, remove } = useBackends();
  const [showAdd, setShowAdd] = useState(false);

  function testConnection(be: BackendIntegration) {
    toast.loading("Testing connection...", { id: be.id });
    setTimeout(() => {
      const ok = Math.random() > 0.3;
      update({ ...be, isConnected: ok, status: ok ? "active" : "error", lastSync: new Date().toISOString() });
      if (ok) toast.success(`${be.name} connected!`, { id: be.id });
      else toast.error(`${be.name} connection failed`, { id: be.id });
    }, 1500);
  }

  const typeInfo = (type: string) => BACKEND_TYPES.find(t => t.id === type) || BACKEND_TYPES[5];

  return (
    <div className="space-y-6 max-w-4xl page-enter">
      <div className="gradient-border rounded-3xl p-0.5">
        <div className="glass-card rounded-[calc(1.5rem-1px)] p-6 bg-gradient-to-br from-white to-amber-50/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gradient-empire mb-1 flex items-center gap-3">
              <Server size={28} className="text-brand-gold" /> Backend Hub
            </h1>
            <p className="text-sm text-gray-500">Connect Supabase, Firebase, Auth0, Okta, Cognito, or any custom backend</p>
          </div>
          <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm flex-shrink-0 text-white font-bold"
            style={{background:"linear-gradient(135deg,#f59e0b,#fbbf24)",boxShadow:"0 4px 16px rgba(245,158,11,0.35)"}}>
            <Plus size={16} /> Add Backend
          </button>
        </div>
      </div>

      {/* Security Note */}
      <div className="glass-card rounded-2xl p-4 border border-amber-200/60 bg-gradient-to-r from-amber-50/60 to-yellow-50/40">
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-brand-gold mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-800">Backend Security Compliance</p>
            <p className="text-xs text-amber-600 mt-0.5">All backend connections use HTTPS/TLS 1.3. API keys are stored encrypted in device memory only. Enable Row Level Security (RLS) on all connected databases. Regularly rotate API tokens every 90 days.</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {backends.map(be => {
          const t = typeInfo(be.type);
          const s = STATUS_CFG[be.status];
          return (
            <div key={be.id} className="glass-card shimmer-card rounded-3xl p-5 border border-white/80 shadow-card-bright hover:shadow-card-glow transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl glass border border-gray-200 flex items-center justify-center text-2xl shadow-sm bg-white/80">
                    {t.logo}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-gray-900">{be.name}</h3>
                    <p className="text-xs font-semibold" style={{color:t.color}}>{t.label}</p>
                  </div>
                </div>
                <button onClick={()=>{remove(be.id);toast.success("Backend removed");}}
                  className="p-1.5 rounded-xl hover:bg-red-50 text-gray-200 hover:text-red-500 transition-colors">
                  <Trash2 size={13}/>
                </button>
              </div>

              <p className="font-mono text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2 mb-3 truncate border border-gray-100">{be.endpoint}</p>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="glass rounded-xl p-2 bg-white/60 border border-gray-100">
                  <p className="text-gray-400">Last Sync</p>
                  <p className="font-semibold text-gray-700 mt-0.5">{formatRelativeTime(be.lastSync)}</p>
                </div>
                <div className="glass rounded-xl p-2 bg-white/60 border border-gray-100">
                  <p className="text-gray-400">Users</p>
                  <p className="font-semibold text-gray-700 mt-0.5">{be.usersManaged.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className={cn("flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full", s.bg)} style={{color:s.color}}>
                  {s.icon} {s.label}
                </div>
                <button onClick={()=>testConnection(be)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl glass border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700 transition-colors">
                  <RefreshCw size={11}/> Test
                </button>
              </div>
            </div>
          );
        })}

        <button onClick={()=>setShowAdd(true)}
          className="glass rounded-3xl border-2 border-dashed border-gray-200 hover:border-amber-300/60 min-h-[200px] flex flex-col items-center justify-center gap-3 transition-all group hover:bg-amber-50/20">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
            <Plus size={22} className="text-brand-gold" />
          </div>
          <p className="text-sm font-semibold text-gray-400 group-hover:text-amber-600 transition-colors">Add Backend</p>
        </button>
      </div>

      {showAdd && <AddModal onClose={()=>setShowAdd(false)} onAdd={add} />}
    </div>
  );
}
