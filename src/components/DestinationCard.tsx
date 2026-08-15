import { motion } from "framer-motion";
import { Heart, Star, Wallet } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Destination } from "@/lib/destinations";
import { useCurrency } from "@/lib/currency-context";

type Props = {
  destination: Destination;
  favorited?: boolean;
  onToggleFavorite?: (id: string) => void;
};

export function DestinationCard({ destination, favorited, onToggleFavorite }: Props) {
  const { money } = useCurrency();

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-3xl glass"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <img
          src={destination.image}
          alt={destination.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.(destination.id);
          }}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:scale-110"
          aria-label="Favorite"
        >
          <Heart className={`h-4 w-4 ${favorited ? "fill-red-500 text-red-500" : "text-white"}`} />
        </button>

        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {destination.rating}
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 pt-10">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-amber-300">
            {destination.category}
          </div>
          <h3 className="font-display text-2xl font-bold leading-tight text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
            {destination.name}
          </h3>
          <p className="text-xs font-medium text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>{destination.country}</p>
          <p className="mt-2 line-clamp-2 text-xs text-white/95" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>{destination.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs font-semibold text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>
              <Wallet className="h-3.5 w-3.5" /> {money(destination.budget)}
            </span>
            <Link
              to="/create-trip"
              search={{ destination: destination.name }}
              className="rounded-full gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow transition hover:opacity-95"
            >
              Explore
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
