import { Fingerprint, Lock, ScanFace, KeyRound, Trash2, CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import type { Passkey } from "@/types";

const TYPE_MAP = {
  biometric: { Icon: Fingerprint, color: "text-brand-teal", bg: "bg-brand-teal/15", label: "Biometric / Fingerprint" },
  screenlock: { Icon: Lock, color: "text-brand-violet", bg: "bg-brand-violet/15", label: "Screen Lock Pattern" },
  facial: { Icon: ScanFace, color: "text-brand-gold", bg: "bg-brand-gold/15", label: "Facial Recognition" },
  hardware: { Icon: KeyRound, color: "text-brand-emerald", bg: "bg-brand-emerald/15", label: "Hardware Security Key" },
};

interface PasskeyCardProps {
  passkey: Passkey;
  onToggle: (p: Passkey) => void;
  onDelete: (id: string) => void;
}

export default function PasskeyCard({ passkey, onToggle, onDelete }: PasskeyCardProps) {
  const t = TYPE_MAP[passkey.type];
  const { Icon } = t;

  return (
    <div className={cn(
      "glass-card rounded-2xl p-5 border transition-all hover:scale-[1.01]",
      passkey.isActive ? "border-white/12" : "border-white/6 opacity-70"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", t.bg)}>
            <Icon size={20} className={t.color} />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm text-white">{passkey.name}</h3>
            <p className="text-xs text-slate-500">{t.label}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(passkey.id)}
          className="p-1.5 rounded-lg hover:bg-brand-rose/20 text-slate-600 hover:text-brand-rose transition-colors"
          aria-label="Delete passkey"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="glass rounded-lg p-2">
          <p className="text-slate-500">Device</p>
          <p className="text-slate-300 font-medium truncate">{passkey.deviceName}</p>
        </div>
        <div className="glass rounded-lg p-2">
          <p className="text-slate-500">Last Used</p>
          <p className="text-slate-300 font-medium">{formatRelativeTime(passkey.lastUsed)}</p>
        </div>
        <div className="glass rounded-lg p-2">
          <p className="text-slate-500">Scope</p>
          <p className="text-slate-300 font-medium capitalize">{passkey.scope}</p>
        </div>
        <div className="glass rounded-lg p-2">
          <p className="text-slate-500">Apps Linked</p>
          <p className="text-slate-300 font-medium">{passkey.linkedApps.length}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {passkey.isActive ? (
            <CheckCircle size={14} className="text-brand-emerald" />
          ) : (
            <Circle size={14} className="text-slate-600" />
          )}
          <span className={cn("text-xs font-medium", passkey.isActive ? "text-brand-emerald" : "text-slate-500")}>
            {passkey.isActive ? "Active" : "Disabled"}
          </span>
        </div>
        <button
          onClick={() => onToggle({ ...passkey, isActive: !passkey.isActive })}
          className={cn(
            "relative w-9 h-5 rounded-full transition-colors",
            passkey.isActive ? "bg-brand-emerald" : "bg-white/20"
          )}
        >
          <span className={cn(
            "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
            passkey.isActive ? "translate-x-4" : "translate-x-0.5"
          )} />
        </button>
      </div>
    </div>
  );
}
