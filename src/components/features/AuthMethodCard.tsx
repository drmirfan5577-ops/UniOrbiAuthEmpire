import { cn } from "@/lib/utils";
import type { AuthMethod } from "@/types";

const METHODS: Record<AuthMethod, {
  label: string; description: string; color: string;
  bg: string; border: string; emoji: string;
}> = {
  otp: {
    label: "OTP",
    description: "One-Time Password via SMS or Email",
    emoji: "#",
    color: "text-brand-teal",
    bg: "bg-brand-teal/10",
    border: "border-brand-teal/30",
  },
  password: {
    label: "Password",
    description: "Traditional secure password auth",
    emoji: "🔒",
    color: "text-brand-violet",
    bg: "bg-brand-violet/10",
    border: "border-brand-violet/30",
  },
  smartpin: {
    label: "Smart PIN",
    description: "4–6 digit intelligent PIN",
    emoji: "🔢",
    color: "text-brand-gold",
    bg: "bg-brand-gold/10",
    border: "border-brand-gold/30",
  },
  unicode: {
    label: "Unicode Word",
    description: "Any word as your secret key",
    emoji: "Ω",
    color: "text-brand-emerald",
    bg: "bg-brand-emerald/10",
    border: "border-brand-emerald/30",
  },
  passkey: {
    label: "Passkey",
    description: "Biometric / FaceID / Screen Lock",
    emoji: "👆",
    color: "text-brand-rose",
    bg: "bg-brand-rose/10",
    border: "border-brand-rose/30",
  },
};

interface AuthMethodCardProps {
  method: AuthMethod;
  enabled: boolean;
  isDefault: boolean;
  onToggle: (m: AuthMethod) => void;
  onSetDefault: (m: AuthMethod) => void;
}

export default function AuthMethodCard({
  method, enabled, isDefault, onToggle, onSetDefault
}: AuthMethodCardProps) {
  const m = METHODS[method];
  return (
    <div className={cn(
      "glass-card rounded-2xl p-5 border transition-all duration-200",
      enabled ? `${m.bg} ${m.border}` : "border-white/8 opacity-70 hover:opacity-100"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold", m.bg, m.color)}>
            {m.emoji}
          </div>
          <div>
            <h3 className={cn("font-heading font-semibold text-sm", enabled ? m.color : "text-slate-400")}>
              {m.label}
            </h3>
            <p className="text-xs text-slate-500">{m.description}</p>
          </div>
        </div>
        {/* Toggle */}
        <button
          onClick={() => onToggle(method)}
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
            enabled ? "bg-brand-teal" : "bg-white/20"
          )}
          aria-label={`Toggle ${m.label}`}
        >
          <span className={cn(
            "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
            enabled ? "translate-x-5" : "translate-x-0.5"
          )} />
        </button>
      </div>
      {enabled && (
        <div className="flex items-center justify-between pt-3 border-t border-white/8">
          <span className="text-xs text-slate-500">
            {isDefault ? "✓ Default method" : "Set as default"}
          </span>
          {!isDefault && (
            <button
              onClick={() => onSetDefault(method)}
              className={cn("text-xs font-medium px-3 py-1 rounded-lg transition-colors", m.bg, m.color, "hover:opacity-80")}
            >
              Set Default
            </button>
          )}
          {isDefault && (
            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-lg", m.bg, m.color)}>Default</span>
          )}
        </div>
      )}
    </div>
  );
}
