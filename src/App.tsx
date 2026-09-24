import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";
import LandingPage from "@/pages/LandingPage";
import DashboardPage from "@/pages/DashboardPage";
import AuthSetupPage from "@/pages/AuthSetupPage";
import PasskeysPage from "@/pages/PasskeysPage";
import PasswordManagerPage from "@/pages/PasswordManagerPage";
import SyncSettingsPage from "@/pages/SyncSettingsPage";
import ConnectedAppsPage from "@/pages/ConnectedAppsPage";
import BackendsPage from "@/pages/BackendsPage";
import LegalPage from "@/pages/LegalPage";
import VisionPage from "@/pages/VisionPage";
import AboutPage from "@/pages/AboutPage";
import NotFoundPage from "@/pages/NotFoundPage";
import TOTPPage from "@/pages/TOTPPage";
import SecurityPage from "@/pages/SecurityPage";
import BackupPage from "@/pages/BackupPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loggedIn, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-empire flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-3xl btn-empire flex items-center justify-center animate-float shadow-glow-violet">
            <span className="text-white text-2xl">🛡️</span>
          </div>
          <div className="text-center">
            <p className="font-heading font-bold text-gradient-empire text-lg">Loading Empire…</p>
            <p className="text-gray-400 text-sm mt-1">Initializing secure environment</p>
          </div>
          <div className="flex gap-1.5">
            {[0,1,2].map(i=>(
              <div key={i} className="w-2 h-2 rounded-full bg-brand-crimson animate-bounce-subtle"
                style={{animationDelay:`${i*0.15}s`}} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (!loggedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.8)",
            color: "#1e1b4b",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard"        element={<DashboardPage />} />
          <Route path="/totp"             element={<TOTPPage />} />
          <Route path="/security"         element={<SecurityPage />} />
          <Route path="/auth-setup"       element={<AuthSetupPage />} />
          <Route path="/passkeys"         element={<PasskeysPage />} />
          <Route path="/password-manager" element={<PasswordManagerPage />} />
          <Route path="/backup"           element={<BackupPage />} />
          <Route path="/sync-settings"    element={<SyncSettingsPage />} />
          <Route path="/connected-apps"   element={<ConnectedAppsPage />} />
          <Route path="/backends"         element={<BackendsPage />} />
          <Route path="/legal"            element={<LegalPage />} />
          <Route path="/vision"           element={<VisionPage />} />
          <Route path="/about"            element={<AboutPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
