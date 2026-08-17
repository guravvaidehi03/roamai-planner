import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Calendar, Heart, Loader2, MapPin, Plus, Trash2, Wallet } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SmartImage } from "@/components/SmartImage";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/lib/currency-context";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({ meta: [{ title: "My Trips — RoamAI" }, { name: "description", content: "All your saved AI-generated travel plans in one place." }] }),
  component: Saved,
});

type Trip = {
  id: string;
  destination: string;
  days: number;
  budget: string | null;
  image_url: string | null;
  is_favorite: boolean;
  created_at: string;
};

function Saved() {
  const { money } = useCurrency();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load() {
    const { data } = await supabase.from("trips").select("id,destination,days,budget,image_url,is_favorite,created_at").order("created_at", { ascending: false });
    setTrips((data ?? []) as Trip[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Delete this trip?")) return;
    await supabase.from("trips").delete().eq("id", id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
    toast.success("Trip deleted");
  }

  return (
    <div className="min-h-screen gradient-hero pb-20">
      <Navbar authed />
      <main className="mx-auto max-w-7xl px-4 pt-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold">My <span className="text-gradient">trips</span></h1>
            <p className="mt-1 text-sm text-muted-foreground">{trips.length} saved · powered by AI</p>
          </div>
          <Link to="/create-trip" className="inline-flex items-center gap-2 rounded-full gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
            <Plus className="h-4 w-4" /> New trip
          </Link>
        </div>

        {loading ? (
          <div className="mt-24 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : trips.length === 0 ? (
          <div className="mt-16 rounded-3xl glass p-12 text-center">
            <p className="text-muted-foreground">No trips yet. Let's plan your first adventure.</p>
            <Link to="/create-trip" className="mt-6 inline-flex items-center gap-2 rounded-full gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
              Start planning
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((t, i) => (
              <motion.article
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate({ to: "/trip/$id", params: { id: t.id } })}
                className="group cursor-pointer overflow-hidden rounded-3xl glass"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <SmartImage src={t.image_url} query={t.destination} destination={t.destination} alt={t.destination} aspectClassName="h-full w-full" className="transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {t.is_favorite && (
                    <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full glass-strong">
                      <Heart className="h-4 w-4 fill-primary text-primary" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-primary">
                        <MapPin className="h-3 w-3" /> {t.days} days
                      </div>
                      <h3 className="mt-1 font-display text-xl font-bold">{t.destination}</h3>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); del(t.id); }}
                      className="grid h-9 w-9 place-items-center rounded-full border border-border bg-muted text-destructive hover:bg-secondary"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(t.created_at).toLocaleDateString()}</span>
                    {t.budget && <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> {money(t.budget)}</span>}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
