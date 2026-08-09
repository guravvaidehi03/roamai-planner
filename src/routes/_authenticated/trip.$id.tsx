import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Cloud, Heart, Loader2, MapPin, Trash2, Utensils, Wallet } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import type { TripPlan } from "@/lib/ai-trip.functions";

export const Route = createFileRoute("/_authenticated/trip/$id")({
  head: () => ({ meta: [{ title: "Trip — RoamAI" }, { name: "description", content: "Your AI-generated travel itinerary with map, weather and budget breakdown." }] }),
  component: TripDetails,
});

const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1506929562872-bb4190002468?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80",
];

type Trip = {
  id: string;
  destination: string;
  days: number;
  budget: string | null;
  image_url: string | null;
  is_favorite: boolean;
  ai_response: TripPlan;
  created_at: string;
};

type Weather = { temp: number; code: number; wind: number } | null;

function TripDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<Weather>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("trips").select("*").eq("id", id).single();
      if (error || !data) {
        toast.error("Trip not found");
        navigate({ to: "/saved" });
        return;
      }
      setTrip(data as unknown as Trip);
      setLoading(false);

      // Geocode + weather (free, no keys)
      try {
        const g = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(data.destination)}`, {
          headers: { Accept: "application/json" },
        }).then((r) => r.json());
        if (g?.[0]) {
          const lat = parseFloat(g[0].lat);
          const lon = parseFloat(g[0].lon);
          setCoords({ lat, lon });
          const w = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m`).then((r) => r.json());
          if (w?.current) setWeather({ temp: w.current.temperature_2m, code: w.current.weather_code, wind: w.current.wind_speed_10m });
        }
      } catch {
        /* non-fatal */
      }
    })();
  }, [id, navigate]);

  async function toggleFav() {
    if (!trip) return;
    const next = !trip.is_favorite;
    setTrip({ ...trip, is_favorite: next });
    await supabase.from("trips").update({ is_favorite: next }).eq("id", trip.id);
  }

  async function deleteTrip() {
    if (!trip || !confirm("Delete this trip?")) return;
    await supabase.from("trips").delete().eq("id", trip.id);
    toast.success("Trip deleted");
    navigate({ to: "/saved" });
  }

  if (loading || !trip) {
    return (
      <div className="grid min-h-screen place-items-center gradient-hero">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const plan = trip.ai_response;
  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.1}%2C${coords.lat - 0.08}%2C${coords.lon + 0.1}%2C${coords.lat + 0.08}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`
    : null;

  return (
    <div className="min-h-screen gradient-hero pb-20">
      <Navbar authed />
      <div className="relative h-[52vh] w-full overflow-hidden">
        <img
          src={trip.image_url ?? FALLBACK_COVERS[trip.destination.length % FALLBACK_COVERS.length]}
          alt={trip.destination}
          className="h-full w-full bg-secondary object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        <div className="absolute inset-x-0 bottom-8 mx-auto max-w-6xl px-4">
          <button onClick={() => navigate({ to: "/saved" })} className="mb-4 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
            <ArrowLeft className="h-3 w-3" /> Back to trips
          </button>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-primary">{trip.days} day itinerary</div>
              <h1 className="mt-2 font-display text-5xl font-black sm:text-6xl">{trip.destination}</h1>
              <p className="mt-3 max-w-xl text-muted-foreground">{plan.summary}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button onClick={toggleFav} className="grid h-11 w-11 place-items-center rounded-full glass-strong">
                <Heart className={`h-4 w-4 ${trip.is_favorite ? "fill-primary text-primary" : ""}`} />
              </button>
              <button onClick={deleteTrip} className="grid h-11 w-11 place-items-center rounded-full glass-strong text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 pt-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl glass p-6 lg:col-span-2">
            <h2 className="font-display text-2xl font-bold">Day-by-day itinerary</h2>
            <div className="mt-6 space-y-4">
              {plan.itinerary?.map((d) => (
                <motion.div
                  key={d.day}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-border bg-muted p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-sm font-bold text-primary-foreground">
                      {d.day}
                    </div>
                    <h3 className="font-display font-semibold">{d.title}</h3>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <TimeSlot label="Morning" text={d.morning} />
                    <TimeSlot label="Afternoon" text={d.afternoon} />
                    <TimeSlot label="Evening" text={d.evening} />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl glass p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Cloud className="h-4 w-4" /> Weather now
              </div>
              {weather ? (
                <div className="mt-3">
                  <div className="font-display text-4xl font-bold">{Math.round(weather.temp)}°C</div>
                  <div className="mt-1 text-xs text-muted-foreground">Wind {Math.round(weather.wind)} km/h · {codeToLabel(weather.code)}</div>
                </div>
              ) : (
                <div className="mt-3 text-sm text-muted-foreground">Unavailable</div>
              )}
              <div className="mt-3 text-xs text-muted-foreground">Best time: {plan.best_time_to_visit}</div>
            </div>

            {mapSrc && (
              <div className="overflow-hidden rounded-3xl glass">
                <div className="flex items-center gap-2 border-b border-border p-4 text-sm">
                  <MapPin className="h-4 w-4 text-primary" /> Location
                </div>
                <iframe title="map" src={mapSrc} className="h-64 w-full" />
              </div>
            )}

            <div className="rounded-3xl glass p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4" /> Budget breakdown
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {plan.budget_breakdown?.map((b) => (
                  <li key={b.category} className="flex justify-between border-b border-border pb-2 last:border-0">
                    <span className="text-muted-foreground">{b.category}</span>
                    <span className="font-semibold text-primary">{b.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <ListCard icon={<MapPin className="h-4 w-4" />} title="Nearby attractions" items={plan.recommended_places?.map((p) => ({ t: p.name, s: p.why })) ?? []} />
          <ListCard icon={<Utensils className="h-4 w-4" />} title="Restaurants" items={plan.restaurants?.map((p) => ({ t: p.name, s: `${p.cuisine} — ${p.note}` })) ?? []} />
          <ListCard icon={<MapPin className="h-4 w-4" />} title="Hotels" items={plan.hotels?.map((p) => ({ t: p.name, s: `${p.area} · ${p.price_range}` })) ?? []} />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <TipsCard title="Travel tips" items={plan.travel_tips} />
          <TipsCard title="Packing" items={plan.packing_list} />
          <TipsCard title="Emergency tips" items={plan.emergency_tips} />
        </div>
      </main>
    </div>
  );
}

function TimeSlot({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">{label}</div>
      <div className="mt-1 text-xs text-foreground/90">{text}</div>
    </div>
  );
}

function ListCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: Array<{ t: string; s: string }> }) {
  return (
    <div className="rounded-3xl glass p-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">{icon} {title}</div>
      <ul className="mt-4 space-y-3">
        {items.map((i, idx) => (
          <li key={idx} className="border-b border-border pb-3 last:border-0">
            <div className="font-medium">{i.t}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{i.s}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TipsCard({ title, items }: { title: string; items?: string[] }) {
  return (
    <div className="rounded-3xl glass p-6">
      <div className="font-display font-semibold">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items?.map((t, i) => (
          <li key={i} className="flex gap-2"><span className="text-primary">•</span> {t}</li>
        ))}
      </ul>
    </div>
  );
}

function codeToLabel(code: number) {
  if (code === 0) return "Clear";
  if (code < 3) return "Partly cloudy";
  if (code < 50) return "Cloudy";
  if (code < 70) return "Rain";
  if (code < 80) return "Snow";
  return "Storm";
}
