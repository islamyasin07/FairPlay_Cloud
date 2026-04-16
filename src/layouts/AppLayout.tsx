import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Menu, X, Shield } from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import FloatingMusicPlayer from "../components/media/FloatingMusicPlayer";

const navItems = [
  { label: "Overview", path: "/" },
  { label: "Incidents", path: "/incidents" },
  { label: "Players", path: "/players" },
  { label: "Audit Log", path: "/audit" },
  { label: "System Health", path: "/health" },
];

function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="ambient-cloud ambient-cloud-a left-[-120px] top-[120px] h-[260px] w-[260px]" />
      <div className="ambient-cloud ambient-cloud-b right-[-80px] top-[40px] h-[220px] w-[220px]" />
      <div className="ambient-cloud ambient-cloud-a bottom-[80px] left-[30%] h-[180px] w-[180px]" />
      <div className="pointer-events-none absolute inset-0 soft-grid opacity-40" />

      <header className="glass-panel relative z-30 flex items-center justify-between border-b border-slate-800/70 px-4 py-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-2">
            <Shield className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-cyan-400">
              FairPlay Cloud
            </h1>
            <p className="text-xs text-slate-400">Moderator Console</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="rounded-2xl border border-slate-700 bg-slate-900/70 p-2 text-slate-200 transition hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <div className="relative flex min-h-screen items-stretch">
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <aside
          className={`glass-panel fixed left-0 top-0 z-30 flex h-dvh w-72 flex-col border-r border-slate-800/70 p-6 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 hidden lg:block">
            <div className="inline-flex rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
              Live Defense
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.18)]">
              FairPlay Cloud
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Anti-Cheat Moderator Console
            </p>
          </div>

          <div className="mb-8 lg:hidden">
            <h1 className="text-2xl font-bold tracking-tight text-cyan-400">
              FairPlay Cloud
            </h1>
            <p className="mt-2 text-sm text-slate-400">Anti-Cheat Moderator Console</p>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-medium transition duration-200 ${
                    isActive
                      ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.08)]"
                      : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="glass-panel mt-6 rounded-3xl p-4">
            <p className="text-sm font-medium text-white">Environment</p>
            <p className="mt-1 text-xs text-slate-400">
              Development workspace active
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="ambient-glow inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.7)]" />
              <StatusBadge label="System Online" tone="success" />
            </div>
          </div>
        </aside>

        <main className="relative z-10 flex-1 px-4 py-6 sm:px-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <FloatingMusicPlayer
        tracks={[
          {
            title: "Under the Bright Lights",
            audioSrc: "/media/under-the-bright-lights.mp3",
            coverImage: "/media/under-the-bright-lights.jpg",
          },
        ]}
      />
    </div>
  );
}

export default AppLayout;