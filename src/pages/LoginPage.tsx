import { Shield, Lock, Mail, PlayCircle } from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import FloatingMusicPlayer from "../components/media/FloatingMusicPlayer";

function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 soft-grid opacity-30" />
      <div className="ambient-cloud ambient-cloud-a left-[-80px] top-[90px] h-[220px] w-[220px]" />
      <div className="ambient-cloud ambient-cloud-b right-[-60px] bottom-[60px] h-[220px] w-[220px]" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative hidden overflow-hidden lg:block">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/media/login-cs2.mp4"
            autoPlay
            muted
            loop
            playsInline
          />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 via-slate-950/30 to-slate-950/70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_28%)]" />

          <div className="absolute left-10 top-10 max-w-lg">
            <div className="inline-flex rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.10)]">
              FairPlay Access
            </div>

            <h1 className="mt-6 text-5xl font-bold leading-tight text-white drop-shadow-[0_0_18px_rgba(34,211,238,0.16)]">
              Enter the
              <span className="block text-cyan-400">Anti-Cheat Command Center</span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              </p>
          </div>

          <div className="absolute bottom-10 left-10 right-10">
            <div className="glass-panel max-w-xl rounded-[28px] p-5">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3">
                  <PlayCircle className="h-6 w-6 text-cyan-300" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Tactical Intro Sequence
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    CS2 cinematic panel active
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="glass-panel relative w-full max-w-md rounded-[30px] p-8 shadow-[0_0_50px_rgba(34,211,238,0.08)]">
            <div className="pointer-events-none absolute -left-10 top-0 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative mb-8 flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3">
                  <Shield className="h-6 w-6 text-cyan-300" />
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.15)]">
                  FairPlay Cloud
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Secure moderator access for the anti-cheat monitoring platform.
                </p>
              </div>

              <StatusBadge label="Protected Access" tone="info" />
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 transition hover:border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-500">Email address</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 transition hover:border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-500">Password</span>
                </div>
              </div>

              <button className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition duration-200 hover:bg-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.25)]">
                Sign In
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Security Note
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Authentication will later be connected to the cloud backend and protected access workflow.
              </p>
            </div>
          </div>
        </div>
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

export default LoginPage;