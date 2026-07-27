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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email if confirmation is required.");
        navigate({ to: "/dashboard" });
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset email sent.");
        setMode("login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
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
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium transition hover:bg-white/10 disabled:opacity-50"
            >
              <FcGoogle className="h-5 w-5" /> Continue with Google
            </button>
          )}

          {mode !== "forgot" && (
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-white/10" /> or <div className="h-px flex-1 bg-white/10" />
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
          background: color-mix(in oklab, white 4%, transparent);
          border: 1px solid color-mix(in oklab, white 10%, transparent);
          padding: 0.75rem 1rem;
          color: inherit;
          outline: none;
          transition: border-color .2s, background .2s;
        }
        .input:focus { border-color: var(--color-primary); background: color-mix(in oklab, white 6%, transparent); }
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
