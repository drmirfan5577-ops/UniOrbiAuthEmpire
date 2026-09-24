import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Shield, Bell, ChevronDown, LogOut, Settings, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME, NAV_LINKS } from "@/constants";

interface NavbarProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export default function Navbar({ onMenuToggle, isSidebarOpen }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const currentPage = NAV_LINKS.find(l => location.pathname.startsWith(l.path))?.label || "Empire";

  function handleLogout() { logout(); navigate("/"); }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16">
      <div className="glass-strong border-b border-white/60 h-full px-4 flex items-center justify-between shadow-sm">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuToggle}
            className="p-2 rounded-xl hover:bg-black/5 transition-colors text-gray-600 hover:text-gray-900 lg:hidden" aria-label="Toggle menu">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl btn-empire flex items-center justify-center shadow-glow-violet group-hover:scale-110 transition-transform">
              <Shield size={14} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-extrabold text-sm text-gradient-empire">{APP_NAME}</span>
            </div>
          </Link>
          <div className="hidden lg:flex items-center gap-1 text-gray-300">
            <span>/</span>
            <span className="text-sm text-gray-700 font-semibold">{currentPage}</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Live status */}
          <div className="hidden md:flex items-center gap-2 glass px-3 py-1.5 rounded-xl border border-emerald-200/60 bg-emerald-50/60">
            <div className="status-dot-active" />
            <span className="text-xs text-emerald-700 font-semibold">Secured</span>
          </div>
          {/* Empire badge */}
          <div className="hidden sm:flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl border border-white/70 bg-white/50">
            <Zap size={12} className="text-brand-crimson" />
            <span className="text-xs text-gray-600 font-semibold">Live</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="relative p-2 rounded-xl hover:bg-black/5 transition-colors text-gray-500 hover:text-gray-900">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-crimson rounded-full animate-pulse" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 glass-card rounded-3xl p-4 shadow-card-float border border-white/80 animate-slide-up z-50">
                <h3 className="font-heading font-bold text-sm text-gray-900 mb-3">Notifications</h3>
                {[
                  { text: "TOTP code generated for Gmail", time: "2m ago", color: "text-brand-crimson" },
                  { text: "Auto-sync completed — 4 apps", time: "1h ago", color: "text-brand-aurora" },
                  { text: "Security score: 85/100 · Strong", time: "24h ago", color: "text-brand-emerald" },
                ].map((n, i) => (
                  <div key={i} className="py-2 border-b border-gray-100 last:border-0">
                    <p className="text-xs text-gray-700">{n.text}</p>
                    <p className={cn("text-xs mt-0.5 font-semibold", n.color)}>{n.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-black/5 transition-colors">
              <div className="w-7 h-7 rounded-xl btn-empire flex items-center justify-center text-xs font-bold text-white">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="hidden sm:block text-sm text-gray-700 font-semibold max-w-[100px] truncate">
                {user?.displayName || "User"}
              </span>
              <ChevronDown size={13} className="text-gray-400" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-12 w-56 glass-card rounded-3xl p-2 shadow-card-float border border-white/80 animate-slide-up z-50">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.displayName}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                <Link to="/auth-setup" onClick={()=>setProfileOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium">
                  <Settings size={14} /> Auth Settings
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl hover:bg-red-50 transition-colors text-sm text-brand-crimson font-medium mt-1">
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
