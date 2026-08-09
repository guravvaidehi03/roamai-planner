import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";

type TripLocation = {
  id: string;
  trip_id: string;
  destination: string;
  latitude: number;
  longitude: number;
  visited_at: string | null;
};

export function TripLocationsMap() {
  const [locations, setLocations] = useState<TripLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<TripLocation | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("trip_locations")
        .select("id,trip_id,destination,latitude,longitude,visited_at")
        .order("visited_at", { ascending: false });
      setLocations((data ?? []) as TripLocation[]);
      setLoading(false);
    })();
  }, []);

  // Calculate map bounds
  const bounds = locations.length > 0
    ? {
        minLat: Math.min(...locations.map((l) => l.latitude)) - 2,
        maxLat: Math.max(...locations.map((l) => l.latitude)) + 2,
        minLon: Math.min(...locations.map((l) => l.longitude)) - 2,
        maxLon: Math.max(...locations.map((l) => l.longitude)) + 2,
      }
    : { minLat: -60, maxLat: 80, minLon: -180, maxLon: 180 };

  const mapSrc = locations.length > 0
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${bounds.minLon}%2C${bounds.minLat}%2C${bounds.maxLon}%2C${bounds.maxLat}&layer=mapnik${locations.length === 1 ? `&marker=${locations[0].latitude}%2C${locations[0].longitude}` : ""}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=-180%2C-60%2C180%2C80&layer=mapnik`;

  if (loading) {
    return (
      <div className="rounded-3xl glass p-6 animate-pulse">
        <div className="h-64 rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl glass overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-5">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="font-display font-semibold">My Trip Locations</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {locations.length} location{locations.length !== 1 ? "s" : ""} tracked
        </span>
      </div>

      {locations.length === 0 ? (
        <div className="p-8 text-center">
          <Navigation className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            No trip locations yet. Create a trip to start tracking!
          </p>
          <Link
            to="/create-trip"
            className="mt-4 inline-flex items-center gap-2 rounded-full gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow"
          >
            Plan a trip
          </Link>
        </div>
      ) : (
        <>
          <iframe
            title="Trip locations map"
            src={mapSrc}
            className="h-64 w-full border-0"
          />
          <div className="max-h-48 overflow-y-auto p-4">
            <div className="space-y-2">
              {locations.map((loc) => (
                <motion.button
                  key={loc.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedLocation(selectedLocation?.id === loc.id ? null : loc)}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                    selectedLocation?.id === loc.id
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-muted hover:bg-secondary"
                  }`}
                >
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{loc.destination}</div>
                    <div className="text-xs text-muted-foreground">
                      {loc.latitude.toFixed(4)}°, {loc.longitude.toFixed(4)}°
                      {loc.visited_at && (
                        <> · {new Date(loc.visited_at).toLocaleDateString()}</>
                      )}
                    </div>
                  </div>
                  <Link
                    to="/trip/$id"
                    params={{ id: loc.trip_id }}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 rounded-full bg-secondary px-2 py-1 text-[10px] font-medium hover:bg-secondary"
                  >
                    View
                  </Link>
                </motion.button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}