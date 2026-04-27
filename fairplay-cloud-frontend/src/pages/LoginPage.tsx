import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  Shield,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.trim().length > 0,
    [email, password]
  );

  const handleSubmit = async () => {
    setError("");

    if (!canSubmit) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      navigate("/app");
    } else {
      setError(result.message ?? "Login failed. Please try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.16),transparent_28%),linear-gradient(180deg,rgba(8,15,28,0.65),rgba(4,8,16,0.92))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:42px_42px] opacity-25" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 lg:block">
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-35"
            src="/media/login-cs2.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/30 via-slate-950/35 to-slate-900/90" />

          <div className="relative flex h-full flex-col justify-between p-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Secure Control Surface
              </div>

              <div className="mt-8 max-w-xl">
                <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white">
                  <span className="block bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                    FairPlay Cloud
                  </span>
                  <span className="mt-4 block text-slate-100">
                    Anti-cheat operations, designed like a flagship console.
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                  This is the command center for moderation, incidents, and visibility. The interface is built to feel premium, decisive, and unmistakably serious.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Protected", "JWT + Backend Guard"],
                ["Persistent", "Player stays alive everywhere"],
                ["Fast", "Optimized media and routes"],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-3xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-xl"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="absolute left-0 top-1/4 h-56 w-1 bg-gradient-to-b from-cyan-400/70 via-cyan-400/20 to-transparent" />

          <div className="w-full max-w-lg">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-400/30">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                  FairPlay Cloud
                </p>
                <p className="text-xs text-slate-400">Moderator access portal</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-10">
              <div className="absolute -right-10 top-6 h-32 w-32 rounded-full bg-cyan-400/12 blur-3xl" />
              <div className="absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-violet-400/12 blur-3xl" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Protected Access
                  </div>
                  <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Sign in to continue
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
                    One secure login opens the full incident dashboard, player controls, and analytics suite.
                  </p>
                </div>

                <div className="hidden rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-3 sm:block">
                  <Globe className="h-6 w-6 text-cyan-200" />
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/45 p-5">
                <div className="flex items-center gap-3">
                  <img
                    src="/media/worldLow.svg"
                    alt="Global signal"
                    className="h-12 w-12 rounded-2xl border border-cyan-400/10 bg-slate-900/60 object-cover p-2"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">Secure Gateway</p>
                    <p className="text-xs text-slate-400">
                      Authentication is required for every protected action.
                    </p>
                  </div>
                </div>
              </div>

              <form
                className="mt-8 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSubmit();
                }}
              >
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Email
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 transition focus-within:border-cyan-400/40 focus-within:bg-slate-950/85">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@fairplay.local"
                      autoComplete="username"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Password
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 transition focus-within:border-cyan-400/40 focus-within:bg-slate-950/85">
                    <Lock className="h-4 w-4 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="rounded-lg p-1 text-slate-500 transition hover:bg-white/5 hover:text-cyan-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </label>

                {error && (
                  <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !canSubmit}
                  className="group relative mt-2 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 px-5 py-3.5 font-semibold text-slate-950 shadow-[0_18px_36px_rgba(34,211,238,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_44px_rgba(34,211,238,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {isSubmitting ? "Verifying access..." : "Enter the console"}
                    {!isSubmitting && (
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    )}
                  </span>
                  <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>
              </form>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Locked Down", "Only authorized users can reach protected routes."],
                  ["Persistent Player", "Ambient audio stays available across pages."],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-slate-950/45 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
                      {title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
