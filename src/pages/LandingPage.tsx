// ─── Vibrant Animated Landing Page ────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, Fingerprint, RefreshCw, Globe, Lock, KeyRound,
  Hash, Type, ArrowRight, CheckCircle, Zap, Server, Scan,
  Bell, Key, AlertTriangle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME, APP_TAGLINE, COMPANY_NAME } from "@/constants";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: Hash,        title: "TOTP / OTP Auth",      desc: "RFC-6238 compliant TOTP with QR scanning and live 30s refresh",     color: "#dc2626" },
  { icon: Lock,        title: "Password Vault",        desc: "AES-256-GCM encrypted credentials stored device-locally",            color: "#8b5cf6" },
  { icon: KeyRound,    title: "Smart PIN System",      desc: "Animated 4–6 digit PIN pad with haptic-style feedback and lockout", color: "#f59e0b" },
  { icon: Type,        title: "Unicode Word Key",      desc: "Any word — Mango, Pakistan, Book — as your secret auth key",        color: "#10b981" },
  { icon: Fingerprint, title: "Biometric Passkeys",    desc: "Fingerprint, Face ID, Screen Lock — FIDO2/WebAuthn standard",       color: "#06b6d4" },
  { icon: RefreshCw,   title: "Auto Sync Engine",      desc: "Same-device OTP syncing with per-app permission control",            color: "#d946ef" },
  { icon: Scan,        title: "Security Scanner",      desc: "24-hr auto scan · Link threat detection · Warning siren alerts",    color: "#dc2626" },
  { icon: Server,      title: "Backend Hub",           desc: "Connect Supabase, Firebase, Auth0, Okta, Cognito or custom",        color: "#f59e0b" },
  { icon: Bell,        title: "Threat Alerts 🚨",      desc: "Real-time suspicious activity detection with instant warnings",      color: "#ef4444" },
  { icon: Key,         title: "2FA System",            desc: "GitHub-style 2FA with TOTP, recovery codes, and server-side verify", color: "#06b6d4" },
  { icon: Shield,      title: "Multi-Auth Orders",     desc: "Combine any methods or use OneAuth — your rules, your order",        color: "#8b5cf6" },
  { icon: Globe,       title: "Universal Login",       desc: "One passkey/unicode for all or per-app — fully configurable",       color: "#10b981" },
];

const STATS = [
  { value: "12+",  label: "Auth Methods",    color: "#dc2626" },
  { value: "∞",    label: "Connected Apps",  color: "#8b5cf6" },
  { value: "256",  label: "AES-GCM Bit Key", color: "#06b6d4" },
  { value: "0ms",  label: "Server Exposure", color: "#10b981" },
];

// Animated Background Orbs
function AnimatedBg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Large drifting orbs */}
      <div className="orb orb-crimson w-96 h-96 top-[-10%] left-[-5%] animate-orb-drift" style={{animationDelay:"0s"}} />
      <div className="orb orb-aurora  w-80 h-80 top-[20%] right-[-5%] animate-orb-drift" style={{animationDelay:"4s"}} />
      <div className="orb orb-emerald w-72 h-72 bottom-[10%] left-[10%] animate-orb-drift" style={{animationDelay:"8s"}} />
      <div className="orb orb-violet  w-64 h-64 bottom-[-5%] right-[20%] animate-orb-drift" style={{animationDelay:"2s"}} />
      <div className="orb orb-gold    w-56 h-56 top-[50%] left-[40%] animate-orb-drift" style={{animationDelay:"6s"}} />
      {/* Small fast orbs */}
      <div className="orb orb-crimson w-32 h-32 top-[30%] left-[20%] animate-float-fast opacity-30" style={{animationDelay:"1s"}} />
      <div className="orb orb-aurora  w-24 h-24 top-[70%] right-[30%] animate-float opacity-25" style={{animationDelay:"3s"}} />
      {/* Scan line */}
      <div className="scan-overlay fixed inset-0 rounded-none" />
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
    </div>
  );
}

interface LoginModalProps {
  onClose: () => void;
  onLogin: (displayName: string, email: string) => void;
}

function LoginModal({ onClose, onLogin }: LoginModalProps) {
  const [mode, setMode] = useState<"login"|"setup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState(1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "setup" && step === 1) { setStep(2); return; }
    onLogin(name || "Auth Empire User", email || "user@authempire.com");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/20 backdrop-blur-2xl" onClick={onClose}>
      <div className="gradient-border animate-slide-up" style={{maxWidth:"420px",width:"100%"}} onClick={e=>e.stopPropagation()}>
        <div className="glass-strong rounded-[calc(1.5rem-1px)] p-8 bg-white/90">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-3xl btn-empire flex items-center justify-center mx-auto mb-3 shadow-glow-violet animate-float">
              <Shield size={28} className="text-white" />
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-gradient-empire">{APP_NAME}</h2>
            <p className="text-xs text-gray-500 mt-1">Enterprise OAuth System · ESOneWorld</p>
          </div>

          {/* Toggle */}
          <div className="flex p-1 glass rounded-2xl mb-6 bg-gray-100/80">
            <button onClick={() => {setMode("login");setStep(1);}}
              className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                mode==="login" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}>
              Sign In
            </button>
            <button onClick={() => {setMode("setup");setStep(1);}}
              className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                mode==="setup" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}>
              Setup Empire
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode==="setup" && step===1 && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Display Name</label>
                  <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name or alias"
                    className="w-full glass rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-aurora/50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Recovery Email</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@example.com"
                    className="w-full glass rounded-2xl px-4 py-3 text-sm text-gray-900 bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-aurora/50" />
                </div>
              </>
            )}

            {(mode==="login" || step===2) && (
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Master PIN (4 digits)</label>
                <input type="password" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,4))}
                  placeholder="• • • •" maxLength={4} autoFocus
                  className="w-full glass rounded-2xl px-4 py-4 text-xl text-center font-mono tracking-[1em] font-bold text-gray-900 bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-crimson/50" />
                {mode==="login" && <p className="text-xs text-gray-400 mt-1.5 text-center">Demo: enter any 4 digits</p>}
              </div>
            )}

            <button type="submit" className="w-full py-4 rounded-2xl btn-empire text-sm flex items-center justify-center gap-2 mt-2">
              {mode==="setup"&&step===1 ? "Continue" : mode==="setup" ? "Launch My Empire" : "Enter Empire"}
              <ArrowRight size={16} />
            </button>

            {mode==="login" && (
              <button type="button" onClick={()=>{setMode("setup");setStep(1);}}
                className="w-full py-2 text-xs text-gray-400 hover:text-brand-aurora transition-colors">
                First time? Set up your empire →
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const { login, completeSetup } = useAuth();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTick(t => t+1), 3000);
    return () => clearInterval(iv);
  }, []);

  function handleLogin(displayName: string, email: string) {
    login({ displayName, email });
    completeSetup();
    setShowLogin(false);
    navigate("/dashboard");
  }

  const tickerItems = ["🔴 LIVE · TOTP Codes Refreshing", "🟢 Auto-Sync Active", "🔵 AES-256-GCM Encrypted", "🟣 Zero Server Exposure", "🔴 Threat Scanner Running", "🟢 Biometric Passkeys Ready"];

  return (
    <div className="relative min-h-screen bg-empire overflow-x-hidden">
      <AnimatedBg />

      {/* LIVE TICKER */}
      <div className="fixed top-0 left-0 right-0 z-50 h-8 bg-gradient-to-r from-brand-crimson via-brand-violet to-brand-aurora overflow-hidden flex items-center">
        <div className="ticker-wrap flex-1">
          <div className="ticker-inner flex gap-16 text-white text-xs font-semibold">
            {[...tickerItems,...tickerItems,...tickerItems].map((item,i)=>(
              <span key={i} className="whitespace-nowrap px-4">{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-8 left-0 right-0 z-40 h-16">
        <div className="glass-strong border-b border-white/60 h-full px-6 flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl btn-empire flex items-center justify-center shadow-glow-violet">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-heading font-extrabold text-sm text-gradient-empire">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl border border-emerald-200/60 bg-emerald-50/60">
              <div className="status-dot-active" />
              <span className="text-xs text-emerald-700 font-semibold">All Systems Active</span>
            </div>
            <button onClick={()=>setShowLogin(true)}
              className="px-5 py-2 rounded-2xl btn-empire text-sm">
              Enter Empire
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 min-h-screen flex items-center z-10">
        <div className="max-w-screen-xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full border border-white/70 mb-8 shadow-sm animate-fade-in">
            <div className="status-dot-active" />
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Enterprise OAuth System · ESOneWorld · v3.0</span>
          </div>

          <h1 className="font-heading font-extrabold text-5xl sm:text-7xl lg:text-8xl leading-none mb-6 animate-slide-up">
            <span className="text-gradient-crimson">Your</span>
            {" "}<span className="text-gradient-aurora">Identity.</span>
            <br />
            <span className="text-gradient-emerald">Your</span>
            {" "}<span className="text-gradient-royal">Rules.</span>
            <br />
            <span className="text-gradient-empire animate-gradient-bg">Your Empire.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed animate-slide-up">
            The most advanced personal OAuth authentication empire. TOTP 2FA, Smart PIN pad, Biometric Passkeys,
            Unicode Words, AES-256 encrypted backup, auto threat scanning — all <strong>device-local</strong>, all yours.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up">
            <button onClick={()=>setShowLogin(true)}
              className="group px-10 py-5 rounded-3xl btn-empire text-base flex items-center gap-3 shadow-glow-violet">
              <Shield size={22} />
              Launch Auth Empire
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#features"
              className="px-10 py-5 rounded-3xl glass border border-white/70 text-gray-700 font-bold text-base hover:border-brand-aurora/40 hover:bg-white/70 transition-all">
              Explore Features
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(s=>(
              <div key={s.label} className="glass-card shimmer-card rounded-3xl p-5 text-center border border-white/80 shadow-card-bright">
                <p className="font-heading font-extrabold text-3xl" style={{color:s.color}}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 max-w-screen-xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <span className="text-xs font-extrabold text-brand-crimson uppercase tracking-widest mb-3 block">Complete Feature Empire</span>
          <h2 className="font-heading font-extrabold text-4xl sm:text-5xl mb-4">
            Every Auth Method.<br /><span className="text-gradient-empire">One Platform.</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {FEATURES.map(f=>{
            const Icon = f.icon;
            return (
              <div key={f.title} className="glass-card shimmer-card rounded-3xl p-5 border border-white/80 hover:shadow-card-glow hover:scale-[1.03] transition-all group shadow-card-bright">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{background:`linear-gradient(135deg, ${f.color}18, ${f.color}30)`, border:`1px solid ${f.color}25`}}>
                  <Icon size={20} style={{color:f.color}} />
                </div>
                <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-screen-xl mx-auto">
          <div className="gradient-border rounded-3xl p-0.5">
            <div className="glass-strong rounded-[calc(1.5rem-1px)] p-8 md:p-12 text-center bg-white/80">
              <Globe size={44} className="text-brand-violet mx-auto mb-6 animate-float" />
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl mb-4">
                <span className="text-gradient-royal">It's a Global Family Platform Vision</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-4 leading-relaxed italic text-lg">
                "Neither a Global Village nor a Global Community — It's a Global Family Platform Vision by ESOneWorld.
                We're committed to Enhance the whole world in every field of life within Unity, Integrity and
                Universality — In-sha-Allah Azza-wa-Jall"
              </p>
              <p className="text-brand-violet font-bold text-sm">— Dr. Muhammad Irfan · ESOneWorld</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center relative z-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading font-extrabold text-4xl text-gradient-empire mb-4">
            Ready to Rule Your Auth Empire?
          </h2>
          <p className="text-gray-500 mb-8 text-lg">Set up in 60 seconds. Complete control forever.</p>
          <button onClick={()=>setShowLogin(true)}
            className="group inline-flex items-center gap-3 px-12 py-5 rounded-3xl btn-empire text-base shadow-glow-violet">
            <Zap size={22} />
            Start Now — It's Free
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/50 py-10 px-6 relative z-10 glass-strong">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl btn-empire flex items-center justify-center">
                <Shield size={12} className="text-white" />
              </div>
              <span className="font-heading font-bold text-sm text-gradient-empire">{APP_NAME}</span>
              <span className="text-xs text-gray-400">by {COMPANY_NAME}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
              <a href="mailto:admin@uniorbi.com" className="hover:text-brand-crimson transition-colors">admin@uniorbi.com</a>
              <span>·</span>
              <span>+92300-4737757</span>
              <span>·</span>
              <a href="mailto:admin@drirfan.online" className="hover:text-brand-aurora transition-colors">admin@drirfan.online</a>
            </div>
            <p className="text-xs text-gray-400">© 2026 ESOneWorld. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {showLogin && <LoginModal onClose={()=>setShowLogin(false)} onLogin={handleLogin} />}
    </div>
  );
}
