import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Sparkles, Mail, Lock, ArrowLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — RoamAI" },
      { name: "description", content: "Sign in or create your RoamAI account to start planning AI-powered trips." },
      { property: "og:title", content: "Sign in — RoamAI" },
      { property: "og:description", content: "Sign in to plan AI-powered trips with RoamAI." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;

        // With email confirmation enabled, signUp returns NO session.
        // Never navigate to a protected route here — the auth gate would
        // bounce straight back to /auth and look like "sign up did nothing".
        if (!data.session) {
          setNeedsConfirmation(true);
          setMode("login");
          toast.success("Account created — check your email to confirm, then sign in.");
          return;
        }

        toast.success("Account created — welcome aboard!");
        await navigate({ to: "/dashboard", replace: true });
      } else if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.session) throw new Error("Could not start a session. Please try again.");
        toast.success("Welcome back!");
        await navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset email sent.");
        setMode("login");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      if (/email not confirmed/i.test(message)) {
        setNeedsConfirmation(true);
        toast.error("Your email isn't confirmed yet. Check your inbox, or resend the link below.");
      } else if (/invalid login credentials/i.test(message)) {
        toast.error("Email or password is incorrect. If you just signed up, confirm your email first.");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function resendConfirmation() {
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Confirmation email sent.");
  }

  async function signInGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="relative min-h-screen gradient-hero">
      <div className="absolute inset-0 opacity-40">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl glass-strong p-8 shadow-glow"
        >
          <div className="mb-6 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Roam<span className="text-gradient">AI</span></span>
          </div>

          <h1 className="font-display text-3xl font-bold">
            {mode === "login" ? "Welcome back" : mode === "signup" ? "Start exploring" : "Reset password"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Sign in to continue your journey." : mode === "signup" ? "Create your free RoamAI account." : "We'll email you a reset link."}
          </p>

          {mode !== "forgot" && (
            <button
              onClick={signInGoogle}
              disabled={loading}
              type="button"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-muted py-3 text-sm font-medium transition hover:bg-secondary disabled:opacity-50"
            >
              <FcGoogle className="h-5 w-5" /> Continue with Google
            </button>
          )}

          {mode !== "forgot" && (
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-secondary" /> or <div className="h-px flex-1 bg-secondary" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <Field label="Full name">
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="input" placeholder="Ada Lovelace" />
              </Field>
            )}
            <Field label="Email" icon={<Mail className="h-4 w-4" />}>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="input pl-10" placeholder="you@roam.ai" />
            </Field>
            {mode !== "forgot" && (
              <Field label="Password" icon={<Lock className="h-4 w-4" />}>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} className="input pl-10" placeholder="••••••••" />
              </Field>
            )}

            {mode === "login" && (
              <div className="text-right">
                <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </button>
          </form>
          {needsConfirmation && mode === "login" && (
            <button
              type="button"
              onClick={resendConfirmation}
              disabled={loading}
              className="mt-3 w-full rounded-2xl border border-border py-2.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary disabled:opacity-50"
            >
              Resend confirmation email
            </button>
          )}


          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>Don't have an account? <button onClick={() => setMode("signup")} className="text-primary hover:underline">Sign up</button></>
            ) : mode === "signup" ? (
              <>Already have one? <button onClick={() => setMode("login")} className="text-primary hover:underline">Sign in</button></>
            ) : (
              <button onClick={() => setMode("login")} className="text-primary hover:underline">Back to sign in</button>
            )}
          </div>
        </motion.div>
      </div>

      <style>{`
        .input {
          width: 100%;
          border-radius: 1rem;
          background: var(--color-card);
          border: 1px solid var(--color-input);
          padding: 0.75rem 1rem;
          color: inherit;
          outline: none;
          transition: border-color .2s, background .2s;
        }
        .input.pl-10 { padding-left: 2.75rem; }
        .input::placeholder { color: var(--color-muted-foreground); }
        .input:focus { border-color: var(--color-primary); background: var(--color-card); }
      `}</style>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        {children}
      </div>
    </label>
  );
}
