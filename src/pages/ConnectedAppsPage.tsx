import { useState } from "react";
import { toast } from "sonner";
import { Grid2x2, Plus, X, Trash2, RefreshCw, ExternalLink } from "lucide-react";
import { useApps } from "@/hooks/useLocalData";
import { formatRelativeTime, cn } from "@/lib/utils";
import { AUTH_METHOD_INFO, APP_CATEGORIES } from "@/constants";
import type { ConnectedApp, AuthMethod } from "@/types";

const EMOJI_LIST = ["📧","💬","🐙","🏦","🛒","🎵","📱","🎮","🏥","✈️","📚","💼","🔑","🌐","⚡","🎯"];

function AddAppModal({ onClose, onAdd }: { onClose:()=>void; onAdd:(d:Omit<ConnectedApp,"id"|"addedAt"|"lastAccess">)=>void }) {
  const [form, setForm] = useState({ name:"", domain:"", icon:"📱", category:"Other", authMethod:"password" as AuthMethod, isActive:true, syncEnabled:false, useUniversalLogin:true });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()||!form.domain.trim()) { toast.error("App name and domain required"); return; }
    onAdd(form);
    toast.success(`"${form.name}" connected!`);
    onClose();
  }

  const methodColors: Record<AuthMethod,string> = { otp:"#dc2626",password:"#8b5cf6",smartpin:"#f59e0b",unicode:"#10b981",passkey:"#06b6d4" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-lg" onClick={onClose}>
      <div className="glass-card rounded-3xl p-7 w-full max-w-lg border border-white/80 shadow-card-float animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-bold text-xl text-gray-900 flex items-center gap-2"><Grid2x2 size={20} className="text-brand-crimson"/> Connect App</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"><X size={16}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Icon</label>
            <div className="flex flex-wrap gap-2">{EMOJI_LIST.map(e=>(
              <button key={e} type="button" onClick={()=>setForm({...form,icon:e})}
                className={cn("w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all",
                  form.icon===e ? "border-brand-crimson/60 bg-red-50 scale-110" : "glass border-gray-200 hover:border-gray-300")}>{e}</button>
            ))}</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">App Name *</label>
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Gmail, Twitter..."
                className="w-full glass rounded-2xl px-4 py-2.5 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-crimson/40 bg-white/80" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Domain *</label>
              <input value={form.domain} onChange={e=>setForm({...form,domain:e.target.value})} placeholder="gmail.com"
                className="w-full glass rounded-2xl px-4 py-2.5 text-sm text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-crimson/40 bg-white/80" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Category</label>
            <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
              className="w-full glass rounded-2xl px-4 py-2.5 text-sm text-gray-900 bg-white/80 border border-gray-200 focus:outline-none">
              {APP_CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Auth Method</label>
            <div className="grid grid-cols-5 gap-2">
              {(["otp","password","smartpin","unicode","passkey"] as AuthMethod[]).map(m=>(
                <button key={m} type="button" onClick={()=>setForm({...form,authMethod:m})}
                  className={cn("p-2.5 rounded-xl border text-xs font-bold transition-all text-center",
                    form.authMethod===m ? "shadow-sm border-transparent" : "glass border-gray-200 text-gray-500")}
                  style={form.authMethod===m ? {background:`${methodColors[m]}12`,borderColor:`${methodColors[m]}30`,color:methodColors[m]} : {}}>
                  {AUTH_METHOD_INFO[m].label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {key:"syncEnabled",label:"Auto Sync",icon:<RefreshCw size={14}/>,color:"brand-emerald"},
              {key:"useUniversalLogin",label:"Universal Login",icon:<ExternalLink size={14}/>,color:"brand-aurora"},
            ].map(opt=>(
              <button key={opt.key} type="button" onClick={()=>setForm({...form,[opt.key]:!form[opt.key as keyof typeof form]})}
                className={cn("flex items-center gap-2 p-3 rounded-2xl border transition-all text-sm font-semibold",
                  form[opt.key as keyof typeof form] ? "btn-aurora border-transparent" : "glass border-gray-200 text-gray-600 hover:border-blue-200")}>
                {opt.icon}{opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl glass border border-gray-200 text-gray-700 font-semibold text-sm">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-2xl btn-crimson text-sm">Connect App</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ConnectedAppsPage() {
  const { apps, add, update, remove } = useApps();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("all");

  const cats = ["all", ...Array.from(new Set(apps.map(a=>a.category)))];
  const filtered = filter==="all" ? apps : apps.filter(a=>a.category===filter);
  const methodColors: Record<AuthMethod,string> = { otp:"#dc2626",password:"#8b5cf6",smartpin:"#f59e0b",unicode:"#10b981",passkey:"#06b6d4" };

  return (
    <div className="space-y-6 max-w-5xl page-enter">
      <div className="gradient-border rounded-3xl p-0.5">
        <div className="glass-card rounded-[calc(1.5rem-1px)] p-6 bg-gradient-to-br from-white to-red-50/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gradient-empire mb-1 flex items-center gap-3">
              <Grid2x2 size={28} className="text-brand-crimson"/> Connected Apps
            </h1>
            <p className="text-sm text-gray-500">Per-app auth control · Universal or separate logins · Sync management</p>
          </div>
          <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 px-6 py-3 rounded-2xl btn-crimson text-sm flex-shrink-0">
            <Plus size={16}/> Connect App
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {cats.map(c=>(
          <button key={c} onClick={()=>setFilter(c)}
            className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize",
              filter===c ? "btn-crimson border-transparent" : "glass border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-red-200")}>
            {c==="all" ? `All (${apps.length})` : c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(app=>(
          <div key={app.id} className="glass-card shimmer-card rounded-3xl p-5 border border-white/80 hover:shadow-card-glow transition-all shadow-card-bright">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl glass border border-gray-200 flex items-center justify-center text-2xl bg-white/80 shadow-sm">{app.icon}</div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-gray-900">{app.name}</h3>
                  <p className="text-xs text-gray-400">{app.domain}</p>
                </div>
              </div>
              <button onClick={()=>{remove(app.id);toast.success("App removed");}}
                className="p-1.5 rounded-xl hover:bg-red-50 text-gray-200 hover:text-red-500 transition-colors">
                <Trash2 size={13}/>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="glass rounded-xl p-2 border border-gray-100 bg-white/60">
                <p className="text-[10px] text-gray-400">Auth</p>
                <p className="text-xs font-bold mt-0.5" style={{color:methodColors[app.authMethod]}}>{AUTH_METHOD_INFO[app.authMethod]?.label}</p>
              </div>
              <div className="glass rounded-xl p-2 border border-gray-100 bg-white/60">
                <p className="text-[10px] text-gray-400">Last Access</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">{formatRelativeTime(app.lastAccess)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full",app.isActive?"bg-emerald-500":"bg-gray-300")} />
                <span className="text-xs text-gray-500">{app.category}</span>
                {app.useUniversalLogin && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-600 border border-violet-100 font-bold">Universal</span>}
              </div>
              <button onClick={()=>{ update({...app,syncEnabled:!app.syncEnabled}); toast.success(`Sync ${!app.syncEnabled?"enabled":"disabled"}`); }}
                className={cn("relative w-8 h-4 rounded-full transition-all", app.syncEnabled?"bg-brand-emerald":"bg-gray-200")}>
                <span className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform",app.syncEnabled?"translate-x-4":"translate-x-0.5")} />
              </button>
            </div>
          </div>
        ))}
        <button onClick={()=>setShowAdd(true)}
          className="glass rounded-3xl border-2 border-dashed border-gray-200 hover:border-brand-crimson/40 min-h-[180px] flex flex-col items-center justify-center gap-3 transition-all group hover:bg-red-50/20">
          <div className="w-12 h-12 rounded-2xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
            <Plus size={22} className="text-brand-crimson"/>
          </div>
          <p className="text-sm font-semibold text-gray-400 group-hover:text-brand-crimson transition-colors">Connect App</p>
        </button>
      </div>
      {showAdd && <AddAppModal onClose={()=>setShowAdd(false)} onAdd={add} />}
    </div>
  );
}
