import { useState } from "react";
import { Shield, Lock, Mail, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../components/ui/StatusBadge";
import FloatingMusicPlayer from "../components/media/FloatingMusicPlayer";
import { useAuth } from "../features/auth/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    const success = await login(email, password);

    if (success) {
      navigate("/app");
    } else {
      setError("Login failed. Please try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 soft-grid opacity-30" />
      <div className="ambient-cloud ambient-cloud-a left-[-80px] top-[90px] h-[220px] w-[220px]" />
      <div className="ambient-cloud ambient-cloud-b right-[-60px] bottom-[60px] h-[260px] w-[260px]" />

      <div className="pointer-events-none absolute right-[8%] top-[18%] z-[1] h-[320px] w-[320px] rounded-full bg-cyan-400/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-[12%] bottom-[12%] z-[1] h-[260px] w-[260px] rounded-full bg-violet-500/12 blur-[120px]" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden md:block">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/media/login-cs2.mp4"
            autoPlay
            muted
            loop
            playsInline
          />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/15 via-slate-950/25 to-slate-950/55" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_28%)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-gradient-to-r from-transparent via-slate-950/22 to-slate-950/55 blur-md" />

          <div className="absolute left-10 top-10 max-w-lg">
            <div className="inline-flex rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.10)]">
              FairPlay Access
            </div>

            <h1 className="mt-6 text-5xl font-bold leading-tight text-white drop-shadow-[0_0_18px_rgba(34,211,238,0.16)]">
              Enter the
              <span className="block text-cyan-400">Anti-Cheat Command Center</span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Monitor suspicious player behavior, review critical incidents, and control moderation workflows from a tactical cloud dashboard.
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
          <div className="pointer-events-none absolute left-[-90px] top-0 h-full w-40 bg-gradient-to-r from-transparent via-cyan-500/6 to-transparent blur-2xl" />

          <div className="glass-panel relative w-full max-w-md rounded-[30px] border border-white/10 p-8 shadow-[0_0_60px_rgba(34,211,238,0.10)]">
            <div className="pointer-events-none absolute -left-16 top-10 h-32 w-32 rounded-full bg-cyan-400/12 blur-3xl" />
            <div className="pointer-events-none absolute right-[-18px] top-[-10px] h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-10px] right-[-8px] h-32 w-32 rounded-full bg-violet-500/12 blur-3xl" />

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
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 transition hover:border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              ) : null}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition duration-200 hover:bg-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.25)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Security Note
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                This is currently a frontend-only authentication flow. Backend integration will be connected later.
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