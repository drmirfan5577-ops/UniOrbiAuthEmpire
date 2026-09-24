// ─── Bright Vision Page ───────────────────────────────────────────────────
import { Globe, Heart, Star, Zap, Users, Shield } from "lucide-react";
import { COMPANY_NAME, CONTACT_PHONE, CONTACT_EMAILS } from "@/constants";

export default function VisionPage() {
  return (
    <div className="space-y-6 max-w-4xl page-enter">
      {/* Hero */}
      <div className="gradient-border rounded-3xl p-0.5 shadow-card-glow">
        <div className="glass-card rounded-[calc(1.5rem-1px)] p-8 md:p-12 text-center bg-gradient-to-br from-white to-violet-50/30">
          <div className="w-20 h-20 rounded-3xl btn-empire flex items-center justify-center mx-auto mb-6 animate-float shadow-glow-violet">
            <Globe size={36} className="text-white" />
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-gradient-empire mb-4">
            Vision & Mission
          </h1>
          <div className="max-w-2xl mx-auto">
            <p className="text-xl font-bold text-gradient-royal mb-4 italic">
              "It's a Global Family Platform Vision"
            </p>
            <p className="text-gray-600 leading-relaxed text-lg">
              Neither a Global Village nor a Global Community —<br />
              <strong>It's a Global Family Platform Vision by ESOneWorld.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="glass-card rounded-3xl p-8 border border-white/80 shadow-card-bright bg-gradient-to-br from-cyan-50/30 to-emerald-50/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl btn-emerald flex items-center justify-center flex-shrink-0">
            <Heart size={22} className="text-white" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-2xl text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed text-lg italic">
              "We're committed to Enhance the whole world in every field of life within Unity, Integrity and
              Universality — In-sha-Allah Azza-wa-Jall"
            </p>
            <p className="text-brand-violet font-bold text-base mt-3">— Dr. Muhammad Irfan · ESOneWorld</p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="grid sm:grid-cols-3 gap-5">
        {[
          { icon: <Zap size={24}/>, title:"Unity",       desc:"Bringing humanity together through technology, transcending borders and barriers",     gradient:"from-red-50 to-rose-50",    color:"#dc2626" },
          { icon: <Shield size={24}/>, title:"Integrity", desc:"Complete transparency, honesty, and accountability in every product and service",     gradient:"from-cyan-50 to-sky-50",    color:"#06b6d4" },
          { icon: <Globe size={24}/>, title:"Universality",desc:"Solutions that work for everyone, everywhere — in any language, any culture",       gradient:"from-emerald-50 to-green-50",color:"#10b981" },
        ].map(v=>(
          <div key={v.title} className={`glass-card rounded-3xl p-6 border border-white/80 bg-gradient-to-br ${v.gradient} shadow-card-bright text-center`}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{background:`${v.color}15`,color:v.color}}>
              {v.icon}
            </div>
            <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">{v.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* ESOneWorld Platform */}
      <div className="glass-card rounded-3xl p-8 border border-white/80 shadow-card-bright">
        <h2 className="font-heading font-bold text-2xl text-gray-900 mb-4 flex items-center gap-3">
          <Users size={24} className="text-brand-crimson" /> ESOneWorld Platform
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          ESOneWorld is a global technology initiative dedicated to creating unified, secure, and accessible
          digital infrastructure for humanity. The UniOrbi Auth Empire is our flagship security product —
          designed to give every person on Earth complete control over their digital identity.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {[
            { label:"Platform", value:"ESOneWorld Global" },
            { label:"Founded", value:"2024 · Dr. Muhammad Irfan" },
            { label:"Mission", value:"Enhance Every Field of Life" },
            { label:"Reach", value:"Global · All Cultures" },
          ].map(item=>(
            <div key={item.label} className="glass rounded-2xl p-4 border border-gray-100 bg-white/60">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
              <p className="font-semibold text-gray-900 mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="glass-card rounded-3xl p-8 border border-white/80 bg-gradient-to-br from-red-50/30 to-rose-50/20 shadow-card-bright">
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-4">Contact ESOneWorld</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {CONTACT_EMAILS.slice(0,6).map(e=>(
            <a key={e.email} href={`mailto:${e.email}`}
              className="flex items-center gap-2 p-3 glass rounded-xl border border-gray-100 hover:border-brand-crimson/30 hover:bg-red-50/30 transition-all group">
              <span className="text-xs font-bold text-gray-400 w-20 flex-shrink-0">{e.label}</span>
              <span className="text-xs text-brand-crimson group-hover:underline truncate">{e.email}</span>
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2 p-3 glass rounded-xl border border-gray-100">
          <span className="text-xs font-bold text-gray-400">Phone</span>
          <span className="text-sm font-semibold text-gray-700">{CONTACT_PHONE}</span>
        </div>
      </div>
    </div>
  );
}
