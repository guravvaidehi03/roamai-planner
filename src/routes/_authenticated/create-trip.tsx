import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { generateTripPlan } from "@/lib/ai-trip.functions";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { DESTINATIONS } from "@/lib/destinations";
import { resolveDestinationImage } from "@/lib/place-images";

const searchSchema = z.object({ destination: z.string().optional() });

export const Route = createFileRoute("/_authenticated/create-trip")({
  head: () => ({ meta: [{ title: "Plan a Trip — RoamAI" }, { name: "description", content: "Generate a personalised AI itinerary for your next adventure." }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: CreateTrip,
});

const TRAVEL_TYPES = ["Solo", "Couple", "Family", "Friends", "Business"];
const TRANSPORTS = ["Flight", "Train", "Road trip", "Cruise"];
const HOTELS = ["Hostel", "Boutique", "4-star", "5-star / Luxury", "Airbnb"];
const INTERESTS = ["Culture", "Food", "Nature", "Adventure", "Nightlife", "Shopping", "Relax", "History", "Beach"];

function CreateTrip() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const generate = useServerFn(generateTripPlan);

  const [destination, setDestination] = useState(search.destination ?? "");
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState("₹1,25,000");
  const [travelers, setTravelers] = useState("2");
  const [tripType, setTripType] = useState("Couple");
  const [transport, setTransport] = useState("Flight");
  const [hotel, setHotel] = useState("Boutique");
  const [interests, setInterests] = useState<string[]>(["Culture", "Food"]);
  const [loading, setLoading] = useState(false);

  function toggleInterest(i: string) {
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination.trim()) {
      toast.error("Pick a destination first ✈️");
      return;
    }
    setLoading(true);
    try {
      const plan = await generate({
        data: {
          destination,
          days,
          budget,
          travelers,
          interests,
          tripType,
          transport,
          hotelPreference: hotel,
        },
      });

      // NOTE: source.unsplash.com was retired and always failed — the cover is
      // now resolved from a real image source for the actual destination.
      const image =
        DESTINATIONS.find((d) => d.name.toLowerCase() === destination.toLowerCase())?.image ??
        (await resolveDestinationImage(destination));

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");

      // Geocode the destination to get coordinates
      let latitude: number | null = null;
      let longitude: number | null = null;
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(destination)}`,
          { headers: { Accept: "application/json" } }
        );
        const geoData = await geoRes.json();
        if (geoData?.[0]) {
          latitude = parseFloat(geoData[0].lat);
          longitude = parseFloat(geoData[0].lon);
        }
      } catch {
        /* non-fatal: geocoding failure shouldn't block trip creation */
      }

      const { data: trip, error } = await supabase
        .from("trips")
        .insert({
          user_id: userData.user.id,
          destination,
          days,
          budget,
          travelers,
          interests,
          trip_type: tripType,
          transport,
          hotel_preference: hotel,
          ai_response: plan,
          image_url: image,
          latitude,
          longitude,
        })
        .select()
        .single();

      if (error) throw error;

      // Save trip location if coordinates are available
      if (latitude !== null && longitude !== null) {
        await supabase.from("trip_locations").insert({
          user_id: userData.user.id,
          trip_id: trip.id,
          destination,
          latitude,
          longitude,
          visited_at: new Date().toISOString(),
        });
      }

      toast.success("Trip plan ready! ✨");
      navigate({ to: "/trip/$id", params: { id: trip.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen gradient-hero pb-20">
      <Navbar authed />
      <main className="mx-auto max-w-4xl px-4 pt-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
            <Wand2 className="h-3 w-3 text-primary" /> AI trip designer
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
            Design your <span className="text-gradient">next escape.</span>
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Tell us where and how — RoamAI crafts a full itinerary in seconds.
          </p>
        </motion.div>

        <form onSubmit={onSubmit} className="mt-10 space-y-6 rounded-3xl glass-strong p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Destination">
              <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Kyoto, Japan" className="fld" required />
            </Field>
            <Field label="Number of days">
              <input type="number" min={1} max={30} value={days} onChange={(e) => setDays(Number(e.target.value))} className="fld" />
            </Field>
            <Field label="Budget">
              <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="₹1,25,000" className="fld" />
            </Field>
            <Field label="Travelers">
              <input value={travelers} onChange={(e) => setTravelers(e.target.value)} placeholder="2" className="fld" />
            </Field>
          </div>

          <Field label="Travel type">
            <ChipRow options={TRAVEL_TYPES} value={tripType} onChange={setTripType} />
          </Field>

          <Field label="Interests">
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => {
                const active = interests.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleInterest(i)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      active ? "gradient-primary font-semibold text-primary-foreground shadow-glow" : "border border-border bg-muted hover:bg-secondary"
                    }`}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Transportation">
              <ChipRow options={TRANSPORTS} value={transport} onChange={setTransport} />
            </Field>
            <Field label="Accommodation">
              <ChipRow options={HOTELS} value={hotel} onChange={setHotel} />
            </Field>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-4 font-display font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.005] disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Crafting your itinerary…</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate AI Plan</>
            )}
          </button>
        </form>
      </main>

      <style>{`
        .fld {
          width: 100%; border-radius: 1rem;
          background: color-mix(in oklab, white 4%, transparent);
          border: 1px solid color-mix(in oklab, white 10%, transparent);
          padding: 0.85rem 1rem; color: inherit; outline: none; font-size: 0.9rem;
        }
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

function ChipRow({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          type="button"
          key={o}
          onClick={() => onChange(o)}
          className={`rounded-full px-4 py-2 text-sm transition ${
            value === o ? "gradient-primary font-semibold text-primary-foreground shadow-glow" : "border border-border bg-muted hover:bg-secondary"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
