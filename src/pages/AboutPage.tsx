// ─── Bright About Page ────────────────────────────────────────────────────
import { Users, Shield, Globe, Star, Mail, Phone, ExternalLink } from "lucide-react";
import { APP_NAME, APP_VERSION, COMPANY_NAME, CONTACT_EMAILS, CONTACT_PHONE } from "@/constants";

export default function AboutPage() {
  return (
    <div className="space-y-6 max-w-4xl page-enter">
      {/* Header */}
      <div className="gradient-border rounded-3xl p-0.5 shadow-card-glow">
        <div className="glass-card rounded-[calc(1.5rem-1px)] p-8 text-center bg-gradient-to-br from-white to-red-50/20">
          <div className="w-20 h-20 rounded-3xl btn-empire flex items-center justify-center mx-auto mb-4 animate-float shadow-glow-violet">
            <Shield size={36} className="text-white" />
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-gradient-empire mb-2">{APP_NAME}</h1>
          <p className="text-brand-violet font-semibold">{APP_VERSION} · {COMPANY_NAME}</p>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto">The most advanced personal OAuth authentication system — built for everyone, controlled by you.</p>
        </div>
      </div>

      {/* About Sections */}
      <div className="grid sm:grid-cols-2 gap-5">
        {[
          { icon:<Shield size={22}/>, title:"Enterprise Security", desc:"AES-256-GCM encryption, PBKDF2 key derivation, RFC-6238 TOTP, FIDO2 passkeys — all standards-compliant.", color:"#dc2626", gradient:"from-red-50 to-rose-50" },
          { icon:<Globe size={22}/>, title:"Universal Platform", desc:"Works on any browser, any device. PWA-enabled for offline use. Zero cloud dependency for core auth.", color:"#06b6d4", gradient:"from-cyan-50 to-sky-50" },
          { icon:<Users size={22}/>, title:"ESOneWorld Vision", desc:"Built to empower every human on Earth with secure digital identity. Global Family Platform initiative.", color:"#10b981", gradient:"from-emerald-50 to-green-50" },
          { icon:<Star size={22}/>, title:"Open Architecture", desc:"Connect Supabase, Firebase, Auth0, Okta, Cognito, or any custom backend via the Backend Hub.", color:"#8b5cf6", gradient:"from-violet-50 to-purple-50" },
        ].map(s=>(
          <div key={s.title} className={`glass-card rounded-3xl p-6 border border-white/80 bg-gradient-to-br ${s.gradient} shadow-card-bright`}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 text-white"
              style={{background:`linear-gradient(135deg, ${s.color}, ${s.color}cc)`}}>
              {s.icon}
            </div>
            <h3 className="font-heading font-bold text-base text-gray-900 mb-2">{s.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Contact List */}
      <div className="glass-card rounded-3xl p-8 border border-white/80 shadow-card-bright">
        <h2 className="font-heading font-bold text-xl text-gray-900 mb-5 flex items-center gap-2">
          <Mail size={20} className="text-brand-crimson" /> Contact & Support
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {CONTACT_EMAILS.map(e=>(
            <a key={e.email} href={`mailto:${e.email}`}
              className="flex items-center gap-3 p-3.5 glass rounded-2xl border border-gray-100 hover:border-brand-crimson/30 hover:bg-red-50/30 transition-all group">
              <Mail size={14} className="text-gray-300 group-hover:text-brand-crimson transition-colors flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-400">{e.label}</p>
                <p className="text-xs text-brand-crimson truncate">{e.email}</p>
              </div>
              <ExternalLink size={11} className="text-gray-200 group-hover:text-brand-crimson transition-colors ml-auto flex-shrink-0" />
            </a>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3 p-4 glass rounded-2xl border border-gray-100 bg-gradient-to-r from-cyan-50/30 to-sky-50/20">
          <Phone size={16} className="text-brand-aurora flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-gray-400">Phone / WhatsApp</p>
            <p className="font-semibold text-gray-800">{CONTACT_PHONE}</p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-card-bright">
        <h2 className="font-heading font-bold text-lg text-gray-900 mb-4">Technology Stack</h2>
        <div className="flex flex-wrap gap-3">
          {["React 18 + Vite","TypeScript","Tailwind CSS","Supabase / OnSpace Cloud","Web Crypto API","TOTP RFC-6238","AES-256-GCM","PBKDF2","FIDO2 WebAuthn","PWA","Edge Functions"].map(t=>(
            <span key={t} className="px-3 py-1.5 glass rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white/70">{t}</span>
          ))}
        </div>
      </div>

      <div className="text-center py-4 text-sm text-gray-400">
        © 2026 {COMPANY_NAME} · All rights reserved · Built with ♥ for humanity
      </div>
    </div>
  );
}
