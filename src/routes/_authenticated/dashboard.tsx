import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Settings, Fingerprint } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DestinationCard } from "@/components/DestinationCard";
import { CATEGORIES, DESTINATIONS } from "@/lib/destinations";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Explore — RoamAI" }, { name: "description", content: "Explore trending destinations and start planning your next AI-powered trip." }] }),
  component: Dashboard,
});

function Dashboard() {
  const [name, setName] = useState<string>("Traveler");
  const [loginId, setLoginId] = useState<string>("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata as Record<string, string> | undefined;
      const n = meta?.full_name || meta?.name || data.user?.email?.split("@")[0];
      if (n) setName(n.split(" ")[0]);
      if (data.user?.id) setLoginId(data.user.id);
    });
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("roamai:favs") : null;
    if (stored) setFavorites(new Set(JSON.parse(stored)));
  }, []);

  const filtered = useMemo(() => {
    return DESTINATIONS.filter((d) => {
      const cat = category === "All" || d.category === category;
      const q = !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.country.toLowerCase().includes(query.toLowerCase());
      return cat && q;
    });
  }, [category, query]);

  function toggleFav(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      window.localStorage.setItem("roamai:favs", JSON.stringify([...next]));
      return next;
    });
  }

  const greeting = getGreeting();

  return (
    <div className="min-h-screen gradient-hero pb-20">
      <Navbar authed />
      <main className="mx-auto max-w-7xl px-4 pt-10">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{greeting},</p>
            <h1 className="mt-1 truncate font-display text-3xl font-bold sm:text-4xl">
              {name} <span className="text-gradient">👋</span>
            </h1>
            {loginId && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Fingerprint className="h-3 w-3" />
                <span className="font-mono truncate max-w-[180px]" title={loginId}>
                  ID: {loginId.slice(0, 8)}…{loginId.slice(-4)}
                </span>
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <IconBtn><Bell className="h-4 w-4" /></IconBtn>
            <IconBtn><Settings className="h-4 w-4" /></IconBtn>
            <Link to="/create-trip" className="rounded-full gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
              + New Trip
            </Link>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-full glass px-5 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destinations, countries, or vibes…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                category === c
                  ? "gradient-primary font-semibold text-primary-foreground shadow-glow"
                  : "border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((d) => (
              <DestinationCard key={d.id} destination={d} favorited={favorites.has(d.id)} onToggleFavorite={toggleFav} />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16 rounded-3xl glass p-10 text-center">
            <p className="text-muted-foreground">No destinations match your search. Try a different vibe.</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10">
      {children}
    </button>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
