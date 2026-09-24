// ─── Bright Legal Page ────────────────────────────────────────────────────
import { Scale, Shield, AlertTriangle, Copyright, FileText, Lock } from "lucide-react";
import { APP_NAME, COMPANY_NAME } from "@/constants";

const SECTIONS = [
  {
    id: "disclaimer",
    icon: <AlertTriangle size={22} />,
    title: "Developer Disclaimer",
    color: "#f59e0b",
    gradient: "from-amber-50 to-yellow-50",
    content: `UniOrbi Auth Empire is provided as-is for personal authentication management. All data is stored locally on your device and never transmitted to external servers unless you explicitly enable backend integration. The developers and ESOneWorld are not responsible for any data loss resulting from device failure, forgotten PINs, or improper backup management. Users are solely responsible for maintaining their backup files and PIN codes.`
  },
  {
    id: "privacy",
    icon: <Lock size={22} />,
    title: "Privacy Policy",
    color: "#06b6d4",
    gradient: "from-cyan-50 to-sky-50",
    content: `We collect zero personal data by default. All authentication credentials, TOTP secrets, passkey configurations, and user data are stored exclusively in your device's local storage. When you enable backend integration (OnSpace Cloud/Supabase), data is transmitted securely via HTTPS with AES-256-GCM encryption. We do not sell, share, or monetize any user data. You retain full ownership and control of all data at all times.`
  },
  {
    id: "copyright",
    icon: <Copyright size={22} />,
    title: "Copyright Notice",
    color: "#8b5cf6",
    gradient: "from-violet-50 to-purple-50",
    content: `© 2026 ESOneWorld — Dr. Muhammad Irfan. All rights reserved. UniOrbi Auth Empire, the ESOneWorld name, logo, and all associated intellectual property are the exclusive property of ESOneWorld. Unauthorized reproduction, distribution, or commercial use of this software or its branding is strictly prohibited. The "Global Family Platform Vision" concept and ESOneWorld mission statement are original works protected under international copyright law.`
  },
  {
    id: "terms",
    icon: <FileText size={22} />,
    title: "Terms of Use",
    color: "#10b981",
    gradient: "from-emerald-50 to-green-50",
    content: `By using UniOrbi Auth Empire, you agree to: (1) Use this software only for lawful personal authentication management. (2) Not attempt to reverse-engineer, decompile, or extract encryption keys or algorithms. (3) Not use this system for unauthorized access to third-party accounts. (4) Maintain responsibility for your own backup files and recovery codes. (5) Accept that the developers provide no warranty for any specific use case or outcome.`
  },
  {
    id: "security",
    icon: <Shield size={22} />,
    title: "Security Warnings",
    color: "#dc2626",
    gradient: "from-red-50 to-rose-50",
    content: `IMPORTANT SECURITY WARNINGS: (1) Never share your Master PIN, TOTP secrets, or backup files with anyone. (2) Backup files encrypted with your PIN are only as secure as your PIN — use a strong, unique PIN. (3) Recovery codes are one-time-use — generate new ones after using any. (4) The security scanner may not detect all threats — exercise caution with all external links. (5) For organizational use, implement additional security measures as required by your compliance framework.`
  },
];

export default function LegalPage() {
  return (
    <div className="space-y-6 max-w-4xl page-enter">
      <div className="gradient-border rounded-3xl p-0.5 shadow-card-glow">
        <div className="glass-card rounded-[calc(1.5rem-1px)] p-6 bg-gradient-to-br from-white to-violet-50/20">
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gradient-empire mb-2 flex items-center gap-3">
            <Scale size={28} className="text-brand-violet" /> Legal & Compliance
          </h1>
          <p className="text-sm text-gray-500">Disclaimers, Copyrights, Privacy Policy, Security Warnings · {APP_NAME} by {COMPANY_NAME}</p>
        </div>
      </div>

      {SECTIONS.map(s => (
        <div key={s.id} className={`glass-card rounded-3xl p-6 border border-white/80 bg-gradient-to-br ${s.gradient} shadow-card-bright`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white"
              style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)` }}>
              {s.icon}
            </div>
            <h2 className="font-heading font-bold text-xl text-gray-900">{s.title}</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{s.content}</p>
        </div>
      ))}

      <div className="glass-card rounded-3xl p-6 text-center border border-white/80">
        <p className="text-sm text-gray-500">
          Last updated: January 2026 · For legal inquiries: <a href="mailto:admin@uniorbi.com" className="text-brand-crimson hover:underline">admin@uniorbi.com</a>
        </p>
      </div>
    </div>
  );
}
