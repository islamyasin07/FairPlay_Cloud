import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  KeyRound,
  Lock,
  Mail,
  Shield,
  Sparkles,
  UserCog,
} from "lucide-react";
import { Link } from "react-router-dom";
import { buildApiUrl } from "../services/api";

function SetupPage() {
  const [bootstrapKey, setBootstrapKey] = useState("");
  const [adminId, setAdminId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Admin");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const canSubmit = useMemo(
    () =>
      bootstrapKey.trim().length > 0 &&
      adminId.trim().length > 0 &&
      fullName.trim().length > 0 &&
      email.trim().length > 0 &&
      password.trim().length > 0,
    [bootstrapKey, adminId, fullName, email, password]
  );

  const handleSubmit = async () => {
    setMessage("");
    setIsSuccess(false);

    if (!canSubmit) {
      setMessage("Fill in the bootstrap key and all admin fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(buildApiUrl("/auth/seed-admin"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bootstrap-key": bootstrapKey,
        },
        body: JSON.stringify({
          adminId,
          email,
          fullName,
          role,
          password,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create the admin account.";

        try {
          const errorData = (await response.json()) as { message?: string };
          if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Keep the default error message.
        }

        setMessage(errorMessage);
        return;
      }

      setIsSuccess(true);
      setMessage("Admin account created successfully. You can now sign in.");
      setBootstrapKey("");
      setAdminId("");
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("Admin");
    } catch {
      setMessage("Unable to reach the backend. Check the server and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.16),transparent_28%),linear-gradient(180deg,rgba(8,15,28,0.65),rgba(4,8,16,0.92))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:42px_42px] opacity-25" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 lg:block">
          <div className="absolute inset-0 bg-[url('/media/worldLow.svg')] bg-cover bg-center opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/30 via-slate-950/35 to-slate-900/90" />

          <div className="relative flex h-full flex-col justify-between p-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                First Deployment Setup
              </div>

              <div className="mt-8 max-w-xl">
                <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white">
                  <span className="block bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                    Seed the first admin
                  </span>
                  <span className="mt-4 block text-slate-100">
                    Create the initial moderator account without touching the database manually.
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                  This page closes the first-run gap. Enter the bootstrap key from the backend environment and create the first admin user before signing in.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["One-Time", "Bootstrap is disabled after the first admin exists."],
                ["Controlled", "Backend key required for every seed request."],
                ["Ready", "Redirect straight into the login flow."],
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
                <p className="text-xs text-slate-400">Bootstrap setup portal</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-10">
              <div className="absolute -right-10 top-6 h-32 w-32 rounded-full bg-cyan-400/12 blur-3xl" />
              <div className="absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-violet-400/12 blur-3xl" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Initial Admin Setup
                  </div>
                  <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Create the first admin
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
                    Seed the first account directly from the UI instead of using a manual API call.
                  </p>
                </div>

                <div className="hidden rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-3 sm:block">
                  <UserCog className="h-6 w-6 text-cyan-200" />
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
                    Bootstrap key
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 transition focus-within:border-cyan-400/40 focus-within:bg-slate-950/85">
                    <KeyRound className="h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      value={bootstrapKey}
                      onChange={(e) => setBootstrapKey(e.target.value)}
                      placeholder="Backend bootstrap key"
                      autoComplete="off"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Admin ID
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 transition focus-within:border-cyan-400/40 focus-within:bg-slate-950/85">
                    <UserCog className="h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="admin-001"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Full name
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 transition focus-within:border-cyan-400/40 focus-within:bg-slate-950/85">
                    <Shield className="h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="FairPlay Administrator"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                    />
                  </div>
                </label>

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
                      autoComplete="email"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Role
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 transition focus-within:border-cyan-400/40 focus-within:bg-slate-950/85">
                    <Shield className="h-4 w-4 text-slate-500" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-transparent text-sm text-white outline-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Moderator">Moderator</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Password
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 transition focus-within:border-cyan-400/40 focus-within:bg-slate-950/85">
                    <Lock className="h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a secure password"
                      autoComplete="new-password"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                    />
                  </div>
                </label>

                {message && (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      isSuccess
                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                        : "border-red-500/25 bg-red-500/10 text-red-200"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !canSubmit}
                  className="group relative mt-2 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 px-5 py-3.5 font-semibold text-slate-950 shadow-[0_18px_36px_rgba(34,211,238,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_44px_rgba(34,211,238,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {isSubmitting ? "Seeding admin..." : "Create first admin"}
                    {!isSubmitting && (
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    )}
                  </span>
                  <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>
              </form>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  After the first admin exists, the seed endpoint is disabled.
                </p>
                <Link
                  to="/login"
                  className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                >
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SetupPage;
