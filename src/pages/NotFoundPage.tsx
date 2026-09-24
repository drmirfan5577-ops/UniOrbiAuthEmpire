import { Link } from "react-router-dom";
import { Shield, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-empire flex items-center justify-center p-6 relative overflow-hidden">
      {/* Orbs */}
      <div className="orb orb-crimson w-80 h-80 top-0 left-0 animate-orb-drift" />
      <div className="orb orb-aurora  w-64 h-64 bottom-0 right-0 animate-orb-drift" style={{animationDelay:"3s"}} />

      <div className="relative z-10 text-center max-w-md">
        <div className="w-24 h-24 rounded-3xl btn-empire flex items-center justify-center mx-auto mb-8 animate-float shadow-glow-violet">
          <Shield size={44} className="text-white" />
        </div>
        <h1 className="font-heading font-extrabold text-8xl text-gradient-empire mb-4">404</h1>
        <h2 className="font-heading font-bold text-2xl text-gray-900 mb-3">Page Not Found</h2>
        <p className="text-gray-500 mb-8">This sector of the Auth Empire doesn't exist yet.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard" className="flex items-center gap-2 px-8 py-3 rounded-2xl btn-empire text-base">
            <Home size={18} /> Dashboard
          </Link>
          <Link to="/" className="flex items-center gap-2 px-8 py-3 rounded-2xl glass border border-gray-200 text-gray-700 font-bold text-base hover:bg-white/80 transition-colors">
            <ArrowLeft size={18} /> Landing
          </Link>
        </div>
      </div>
    </div>
  );
}
