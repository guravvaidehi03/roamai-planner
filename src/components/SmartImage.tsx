import { useEffect, useRef, useState } from "react";
import {
  genericFallback,
  invalidatePlaceImage,
  resolveDestinationImage,
  resolvePlaceImage,
} from "@/lib/place-images";

type Props = {
  /** Name of the actual place/hotel/restaurant this image should show. */
  query?: string | null;
  /** Destination context, used to disambiguate the query and to build fallbacks. */
  destination?: string | null;
  /** Already-known URL (e.g. trips.image_url). Tried first, skipped when invalid. */
  src?: string | null;
  alt: string;
  className?: string;
  /** Tailwind aspect utility applied to the wrapper, e.g. "aspect-video". */
  aspectClassName?: string;
  eager?: boolean;
};

type Stage = "loading" | "ready" | "error";

/**
 * Image with a guaranteed, contextual fallback chain:
 *   1. explicit `src` (if it is a valid absolute URL and actually loads)
 *   2. place-specific photo ("<place> <destination>") from Wikipedia/Commons/Openverse
 *   3. destination-specific photo
 *   4. generic travel photo (last resort — never an empty box, never a broken icon)
 */
export function SmartImage({
  query,
  destination,
  src,
  alt,
  className = "",
  aspectClassName = "aspect-video",
  eager = false,
}: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const step = useRef(0);
  const alive = useRef(true);

  const place = (query ?? "").trim();
  const dest = (destination ?? "").trim();
  const validSrc = typeof src === "string" && /^https?:\/\//.test(src.trim()) ? src.trim() : null;

  useEffect(() => {
    alive.current = true;
    step.current = 0;
    setStage("loading");
    setUrl(null);
    void advance(0);
    return () => {
      alive.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validSrc, place, dest]);

  async function advance(from: number) {
    let i = from;
    while (i <= 3) {
      let candidate: string | null = null;
      if (i === 0) candidate = validSrc;
      else if (i === 1 && place) candidate = await resolvePlaceImage(place, dest || undefined);
      else if (i === 2 && dest) candidate = await resolveDestinationImage(dest);
      else if (i === 3) candidate = genericFallback(place || dest || alt);

      if (!alive.current) return;
      if (candidate) {
        step.current = i;
        setUrl(candidate);
        setStage("loading");
        return;
      }
      i++;
    }
    if (alive.current) setStage("error");
  }

  function handleError() {
    // The URL we had is stale/broken — drop it from cache and try the next tier.
    if (step.current === 1 && place) invalidatePlaceImage(place, dest || undefined);
    void advance(step.current + 1);
  }

  return (
    <div className={`relative overflow-hidden bg-muted ${aspectClassName}`}>
      {stage === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-secondary to-muted" />
      )}
      {url && (
        <img
          src={url}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => alive.current && setStage("ready")}
          onError={handleError}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            stage === "ready" ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      )}
      {stage === "error" && (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-secondary to-muted px-2 text-center text-xs font-semibold text-muted-foreground">
          {alt}
        </div>
      )}
    </div>
  );
}
