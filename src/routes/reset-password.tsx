import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Lock, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password — RoamAI" },
      { name: "description", content: "Choose a new password for your RoamAI account." },
      { property: "og:title", content: "Reset password — RoamAI" },
      { property: "og:description", content: "Choose a new password for your RoamAI account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase delivers the recovery session via the URL hash; the client picks
    // it up automatically, so just wait for it to land.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated — you're signed in.");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="relative min-h-screen gradient-hero">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <Link to="/auth" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
        <div className="rounded-3xl glass-strong p-8 shadow-glow">
          <div className="mb-6 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">
              Roam<span className="text-gradient">AI</span>
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold">Set a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ready
              ? "Choose a password you'll remember."
              : "Open this page from the reset link in your email."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">New password</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-input bg-card py-3 pl-10 pr-4 outline-none"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Confirm password</span>
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-input bg-card px-4 py-3 outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={loading || !ready}
              className="mt-2 w-full rounded-2xl gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
