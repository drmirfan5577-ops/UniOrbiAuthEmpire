import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  color: "teal" | "violet" | "gold" | "emerald" | "rose";
  trend?: { value: string; positive: boolean };
  className?: string;
}

const COLOR_MAP = {
  teal: {
    bg: "from-brand-teal/10 to-transparent",
    border: "border-brand-teal/20",
    icon: "bg-brand-teal/20 text-brand-teal",
    glow: "glow-teal",
    text: "text-brand-teal",
  },
  violet: {
    bg: "from-brand-violet/10 to-transparent",
    border: "border-brand-violet/20",
    icon: "bg-brand-violet/20 text-brand-violet",
    glow: "glow-violet",
    text: "text-brand-violet",
  },
  gold: {
    bg: "from-brand-gold/10 to-transparent",
    border: "border-brand-gold/20",
    icon: "bg-brand-gold/20 text-brand-gold",
    glow: "glow-gold",
    text: "text-brand-gold",
  },
  emerald: {
    bg: "from-brand-emerald/10 to-transparent",
    border: "border-brand-emerald/20",
    icon: "bg-brand-emerald/20 text-brand-emerald",
    glow: "",
    text: "text-brand-emerald",
  },
  rose: {
    bg: "from-brand-rose/10 to-transparent",
    border: "border-brand-rose/20",
    icon: "bg-brand-rose/20 text-brand-rose",
    glow: "",
    text: "text-brand-rose",
  },
};

export default function StatsCard({ label, value, subtext, icon, color, trend, className }: StatsCardProps) {
  const c = COLOR_MAP[color];

  return (
    <div className={cn(
      `glass-card rounded-2xl p-5 bg-gradient-to-br ${c.bg} border ${c.border} hover:scale-[1.02] transition-transform`,
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", c.icon)}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-lg",
            trend.positive
              ? "bg-brand-emerald/20 text-brand-emerald"
              : "bg-brand-rose/20 text-brand-rose"
          )}>
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-heading font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400 mt-0.5">{label}</p>
        {subtext && <p className="text-xs text-slate-600 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}
