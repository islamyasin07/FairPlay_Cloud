import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Menu, X, Shield } from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import { useAuth } from "../features/auth/AuthContext";

const navItems = [
  { label: "Overview", path: "/app" },
  { label: "Observability", path: "/app/observability" },
  { label: "Incidents", path: "/app/incidents" },
  { label: "Players", path: "/app/players" },
  { label: "Global Map", path: "/app/map" },
  { label: "Case Command", path: "/app/cases" },
  { label: "Audit Log", path: "/app/audit" },
  { label: "System Health", path: "/app/health" },
];

function BrandBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      {!compact && (
        <div className="inline-flex rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
          Live Defense
        </div>
      )}

      <div className={`flex items-center gap-3 ${compact ? "" : "mt-4"}`}>
        {compact && (
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-2">
            <Shield className="h-5 w-5 text-cyan-300" />
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.18)]">
            FairPlay Cloud
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Anti-Cheat Moderator Console
          </p>
        </div>
      </div>
    </div>
  );
}

function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <div className="relative h-screen overflow-hidden bg-slate-950 text-white">
      <div className="ambient-cloud ambient-cloud-a left-[-120px] top-[120px] h-[260px] w-[260px]" />
      <div className="ambient-cloud ambient-cloud-b right-[-80px] top-[40px] h-[220px] w-[220px]" />
      <div className="ambient-cloud ambient-cloud-a bottom-[80px] left-[30%] h-[180px] w-[180px]" />
      <div className="ambient-cloud ambient-cloud-c left-[42%] top-[-120px] h-[320px] w-[320px]" />
      <div className="ambient-cloud ambient-cloud-b bottom-[-110px] right-[18%] h-[260px] w-[260px]" />
      <div className="pointer-events-none absolute inset-0 soft-grid opacity-40" />

      <header className="glass-panel relative z-30 flex items-center justify-between border-b border-slate-800/70 px-4 py-4 lg:hidden">
        <BrandBlock compact />
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="rounded-2xl border border-slate-700 bg-slate-900/70 p-2 text-slate-200 transition hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <div className="relative flex h-full items-stretch">
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
            <BrandBlock />
          </div>

          <div className="mb-8 lg:hidden">
            <BrandBlock />
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/app"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  [
                    "block rounded-2xl px-4 py-3 text-sm font-medium transition duration-200",
                    isActive
                      ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.08)]"
                      : "text-slate-300 hover:bg-slate-800/70 hover:text-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 space-y-4">
            <div className="glass-panel rounded-3xl p-4">
              <p className="text-sm font-medium text-white">Environment</p>
              <p className="mt-1 text-xs text-slate-400">
                Development workspace active
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="ambient-glow inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.7)]" />
                <StatusBadge label="System Online" tone="success" />
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="relative z-10 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute left-[12%] top-[10%] h-56 w-56 rounded-full bg-cyan-400/10 blur-[110px]" />
            <div className="absolute bottom-[14%] right-[12%] h-64 w-64 rounded-full bg-violet-400/10 blur-[120px]" />
          </div>

          <div className="relative z-10 px-4 pb-6 pt-4 lg:px-8 lg:pb-8 lg:pt-6 lg:pl-10">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}

export default AppLayout;
