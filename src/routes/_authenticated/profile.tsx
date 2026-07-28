import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut, Mail, Save } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { CustomerLoginId } from "@/components/CustomerLoginId";
import { TripLocationsMap } from "@/components/TripLocationsMap";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — RoamAI" }, { name: "description", content: "Manage your RoamAI profile and account." }] }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [tripsCount, setTripsCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      setUserId(userData.user.id);
      setEmail(userData.user.email ?? "");
      const { data: prof } = await supabase.from("profiles").select("full_name,avatar").eq("id", userData.user.id).single();
      setFullName(prof?.full_name ?? "");
      setAvatar(prof?.avatar ?? "");
      const { count } = await supabase.from("trips").select("*", { count: "exact", head: true }).eq("user_id", userData.user.id);
      setTripsCount(count ?? 0);
      const { count: favs } = await supabase.from("trips").select("*", { count: "exact", head: true }).eq("user_id", userData.user.id).eq("is_favorite", true);
      setFavCount(favs ?? 0);
    })();
  }, []);

  async function save() {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase.from("profiles").update({ full_name: fullName, avatar }).eq("id", userData.user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen gradient-hero pb-20">
      <Navbar authed />
      <main className="mx-auto max-w-3xl px-4 pt-10">
        <h1 className="font-display text-4xl font-bold">Your <span className="text-gradient">profile</span></h1>

        <div className="mt-8 flex items-center gap-5 rounded-3xl glass-strong p-6">
          <div className="grid h-20 w-20 shrink-0 overflow-hidden rounded-full gradient-primary place-items-center text-2xl font-bold text-primary-foreground">
            {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : (fullName || email).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-2xl font-bold">{fullName || "Traveler"}</div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> <span className="truncate">{email}</span>
            </div>
            <div className="mt-3 flex gap-4 text-xs">
              <span className="rounded-full bg-white/5 px-3 py-1"><b className="text-primary">{tripsCount}</b> trips created</span>
              <span className="rounded-full bg-white/5 px-3 py-1"><b className="text-primary">{favCount}</b> favorites</span>
            </div>
          </div>
        </div>

        {userId && (
          <div className="mt-6">
            <CustomerLoginId userId={userId} email={email} />
          </div>
        )}

        <div className="mt-6 space-y-4 rounded-3xl glass p-6">
          <Field label="Full name">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="fld" />
          </Field>
          <Field label="Avatar URL">
            <input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" className="fld" />
          </Field>
          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
            </button>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium hover:bg-white/10">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>

        <div className="mt-6">
          <TripLocationsMap />
        </div>
      </main>

      <style>{`
        .fld { width: 100%; border-radius: 1rem; background: color-mix(in oklab, white 4%, transparent);
          border: 1px solid color-mix(in oklab, white 10%, transparent); padding: 0.85rem 1rem; color: inherit; outline: none; font-size: 0.9rem; }
        .fld:focus { border-color: var(--color-primary); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
