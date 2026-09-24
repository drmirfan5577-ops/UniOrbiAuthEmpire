import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

// Animated background orbs component
function LiveBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="orb orb-crimson w-96 h-96 top-[-15%] left-[-8%] animate-orb-drift" style={{animationDelay:"0s"}} />
      <div className="orb orb-aurora  w-80 h-80 top-[30%] right-[-8%]  animate-orb-drift" style={{animationDelay:"5s"}} />
      <div className="orb orb-emerald w-72 h-72 bottom-[5%]  left-[5%]  animate-orb-drift" style={{animationDelay:"10s"}} />
      <div className="orb orb-violet  w-64 h-64 bottom-[-5%] right-[25%] animate-orb-drift" style={{animationDelay:"3s"}} />
      <div className="orb orb-gold    w-48 h-48 top-[60%]   left-[45%]  animate-orb-drift" style={{animationDelay:"7s"}} />
      {/* micro orbs */}
      <div className="orb orb-crimson w-20 h-20 top-[20%] left-[70%]  animate-float-fast opacity-20" style={{animationDelay:"2s"}} />
      <div className="orb orb-aurora  w-16 h-16 top-[80%] right-[10%]  animate-float opacity-15" style={{animationDelay:"4s"}} />
      {/* grid */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{backgroundImage:"linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)", backgroundSize:"48px 48px"}} />
      {/* scan line */}
      <div className="absolute left-0 right-0 h-0.5 pointer-events-none"
        style={{background:"linear-gradient(90deg, transparent, rgba(6,182,212,0.4), transparent)", animation:"scanLine 6s linear infinite"}} />
    </div>
  );
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-empire relative">
      <LiveBackground />
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pt-16 lg:pl-64 min-h-screen relative z-10">
        <div className="p-4 md:p-6 xl:p-8 max-w-screen-2xl mx-auto page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
