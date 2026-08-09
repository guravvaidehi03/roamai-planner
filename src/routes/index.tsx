import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Compass, MapPin, Sparkles, Star, Wallet, Wand2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DESTINATIONS } from "@/lib/destinations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RoamAI — Unlock the World Around You" },
      { name: "description", content: "AI-powered local travel planner. Discover nearby attractions, generate personalised itineraries and craft your next adventure." },
      { property: "og:title", content: "RoamAI — AI Local Travel Planner" },
      { property: "og:description", content: "Discover nearby destinations, generate AI travel plans, and explore your next adventure." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Popular />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Tell us your vibe", body: "Share destination, budget, days and interests." },
    { n: "02", title: "AI drafts your plan", body: "A day-by-day itinerary tuned to your pace." },
    { n: "03", title: "Explore & save", body: "Map, weather, and save trips for later." },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex rounded-full glass px-3 py-1 text-xs font-medium">How it works</div>
        <h2 className="mt-4 font-display text-4xl font-bold">Plan a trip in <span className="text-gradient">three steps</span>.</h2>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-3xl glass p-6"
          >
            <div className="font-display text-4xl font-black text-gradient">{s.n}</div>
            <h3 className="mt-3 font-display text-lg font-bold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-16 sm:pt-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-medium">
            <Sparkles className="h-3 w-3 text-primary" />
            AI-powered trip planning
          </div>
          <h1 className="mt-6 font-display text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Unlock the <span className="text-gradient">world</span> around you.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Discover nearby destinations, generate AI travel plans, and explore
            your next adventure — tailored to your budget, days and vibe.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="group inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02]"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-6 py-3 text-sm font-semibold hover:bg-secondary"
            >
              Learn more
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <Stat value="120+" label="Destinations" />
            <Stat value="4.9★" label="Traveler rating" />
            <Stat value="60s" label="Plan generation" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-glow">
            <img
              src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=80"
              alt="Mountain lake at sunset"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute -left-4 top-16 hidden w-64 rounded-3xl glass-strong p-4 sm:block"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl gradient-primary">
                <MapPin className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Next stop</div>
                <div className="font-display font-bold">Santorini, Greece</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-primary"><Star className="h-3 w-3 fill-primary" /> 4.9</span>
              <span className="flex items-center gap-1 text-muted-foreground"><Wallet className="h-3 w-3" /> $1,800</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute -right-2 bottom-8 hidden w-56 rounded-3xl glass-strong p-4 sm:block"
          >
            <div className="text-xs text-muted-foreground">AI itinerary</div>
            <div className="mt-1 font-display text-sm font-bold">5-day cultural escape</div>
            <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <div>• Day 1 — Oia sunset walk</div>
              <div>• Day 2 — Volcano hike</div>
              <div>• Day 3 — Wine tasting tour</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

function Features() {
  const items = [
    { icon: <Wand2 className="h-5 w-5" />, title: "AI itineraries", body: "Personalized day-by-day plans tuned to your interests, budget and pace." },
    { icon: <Compass className="h-5 w-5" />, title: "Nearby discovery", body: "Attractions, restaurants and hidden gems mapped around you." },
    { icon: <MapPin className="h-5 w-5" />, title: "Interactive maps", body: "See every stop pinned on a beautiful map with routes and timing." },
    { icon: <Wallet className="h-5 w-5" />, title: "Budget breakdown", body: "Realistic cost splits so nothing surprises you on the road." },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex rounded-full glass px-3 py-1 text-xs font-medium">Features</div>
        <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
          Everything you need to <span className="text-gradient">wander smart.</span>
        </h2>
      </div>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-3xl glass p-6 transition hover:-translate-y-1"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl gradient-primary text-primary-foreground">
              {f.icon}
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Popular() {
  const picks = DESTINATIONS.slice(0, 6);
  return (
    <section id="destinations" className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex items-end justify-between">
        <div>
          <div className="inline-flex rounded-full glass px-3 py-1 text-xs font-medium">Trending</div>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Popular destinations</h2>
        </div>
        <Link to="/auth" className="hidden text-sm text-primary hover:underline sm:inline">
          View all →
        </Link>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {picks.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to="/auth"
              className="group relative block aspect-[5/6] overflow-hidden rounded-3xl"
            >
              <img src={d.image} alt={d.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-x-5 bottom-5">
                <div className="text-[11px] font-medium uppercase tracking-widest text-primary">{d.category}</div>
                <div className="font-display text-2xl font-bold">{d.name}</div>
                <div className="text-xs text-white/70">{d.country}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const t = [
    { q: "RoamAI planned my 10-day Japan trip in a minute. It was better than what my travel agent gave me.", a: "Priya S.", r: "Tokyo, 2025" },
    { q: "The budget breakdown alone paid for itself. Zero surprises. Just great local recs.", a: "Marcus L.", r: "Lisbon, 2025" },
    { q: "I asked for 'quiet, food-first, non-touristy Rome' and it delivered exactly that.", a: "Ana R.", r: "Rome, 2025" },
  ];
  return (
    <section id="reviews" className="mx-auto max-w-7xl px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex rounded-full glass px-3 py-1 text-xs font-medium">Loved by travelers</div>
        <h2 className="mt-4 font-display text-4xl font-bold">Real trips, planned smarter.</h2>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {t.map((x) => (
          <div key={x.a} className="rounded-3xl glass p-6">
            <div className="mb-3 flex text-primary">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-primary" />)}
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">"{x.q}"</p>
            <div className="mt-4 text-xs text-muted-foreground">— {x.a}, {x.r}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "How does the AI generate trips?", a: "RoamAI uses a state-of-the-art language model that considers your destination, budget, interests and duration to design day-by-day itineraries." },
    { q: "Is my data private?", a: "Absolutely. Trips are stored securely and only visible to you." },
    { q: "Can I edit a generated plan?", a: "Yes — favorite what you like, regenerate what you don't, and save unlimited trips." },
    { q: "Do I need to pay?", a: "RoamAI is free to try. You can generate plans and save trips from your first session." },
  ];
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-24">
      <div className="text-center">
        <div className="inline-flex rounded-full glass px-3 py-1 text-xs font-medium">FAQ</div>
        <h2 className="mt-4 font-display text-4xl font-bold">Questions, answered.</h2>
      </div>
      <div className="mt-10 space-y-3">
        {items.map((it) => (
          <details key={it.q} className="group rounded-2xl glass p-5 open:shadow-glow">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
              {it.q}
              <span className="text-primary transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
