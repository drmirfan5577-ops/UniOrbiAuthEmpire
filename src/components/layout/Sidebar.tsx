import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Settings2, Fingerprint, KeyRound, RefreshCw,
  Grid2x2, Server, Scale, Globe, Users, ChevronRight, X, Shield,
  Key, Scan, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, APP_VERSION } from "@/constants";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard, Settings2, Fingerprint, KeyRound, RefreshCw,
  Grid2x2, Server, Scale, Globe, Users, Key, Scan, Lock,
};

interface SidebarProps { isOpen: boolean; onClose: () => void; }

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside className={cn(
        "fixed top-0 left-0 h-full z-50 w-64 transition-transform duration-300 ease-in-out",
        "glass-strong border-r border-white/60 shadow-card-float",
        "lg:translate-x-0 lg:z-30",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl btn-empire flex items-center justify-center shadow-glow-violet">
              <Shield size={15} className="text-white" />
            </div>
            <span className="font-heading font-extrabold text-sm text-gradient-empire">Auth Empire</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors lg:hidden">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-3 overflow-y-auto" style={{maxHeight:"calc(100vh - 130px)"}}>
          <div className="space-y-0.5">
            {NAV_LINKS.map(link => {
              const Icon = ICON_MAP[link.icon];
              const isActive = location.pathname === link.path ||
                (link.path !== "/dashboard" && location.pathname.startsWith(link.path));
              return (
                <Link key={link.path} to={link.path} onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm transition-all duration-200 group",
                    isActive
                      ? "bg-gradient-to-r from-red-50 to-rose-50 text-brand-crimson border border-red-100 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/80"
                  )}>
                  <div className="flex items-center gap-3">
                    {Icon && <Icon size={16} className={cn("transition-colors", isActive ? "text-brand-crimson" : "text-gray-400 group-hover:text-gray-600")} />}
                    <span className="font-semibold">{link.label}</span>
                  </div>
                  {isActive && <ChevronRight size={13} className="text-brand-crimson opacity-60" />}
                </Link>
              );
            })}
          </div>

          {/* Security Score */}
          <div className="mt-5 glass-card rounded-3xl p-4 border border-white/80 bg-gradient-to-br from-red-50/50 to-rose-50/30 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-600">Security Score</span>
              <span className="text-xs font-extrabold text-emerald-600">85/100</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-crimson via-brand-violet to-brand-aurora"
                style={{width:"85%", boxShadow:"0 0 6px rgba(220,38,38,0.5)"}} />
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">Strong Level</p>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-white/50 glass">
          <p className="text-xs text-gray-400 text-center">{APP_VERSION} · ESOneWorld</p>
        </div>
      </aside>
    </>
  );
}
