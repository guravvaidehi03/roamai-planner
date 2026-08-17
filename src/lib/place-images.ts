/**
 * Image resolution service.
 *
 * Why this exists: the app previously relied on
 *   1. `https://source.unsplash.com/...` for the main trip cover — that endpoint
 *      was retired by Unsplash and now fails, so every destination that was not
 *      in the curated DESTINATIONS list rendered a broken cover, and
 *   2. a single Wikipedia search per guessed place name — which returned null
 *      very often, leaving empty image containers in the itinerary.
 *
 * The resolver below tries several *contextual* queries against several free,
 * key-less image sources, caches every resolution (memory + sessionStorage) and
 * only ever falls back to a generic travel photo as the very last option.
 */

const GENERIC_FALLBACKS = [
  "https://images.unsplash.com/photo-1506929562872-bb4190002468?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80",
];

/** Deterministic generic photo — used only when every real source failed. */
export function genericFallback(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GENERIC_FALLBACKS[h % GENERIC_FALLBACKS.length];
}

const memoryCache = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();

function cacheKey(place: string, destination?: string) {
  return `img:${(destination ?? "").toLowerCase().trim()}|${place.toLowerCase().trim()}`;
}

function readSession(key: string): string | null | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw === null) return undefined;
    return raw === "" ? null : raw;
  } catch {
    return undefined;
  }
}

function writeSession(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, value ?? "");
  } catch {
    /* storage full / disabled — non-fatal */
  }
}

function isUsableUrl(url: unknown): url is string {
  return typeof url === "string" && /^https?:\/\//.test(url.trim());
}

async function json(url: string, timeoutMs = 8000): Promise<any | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Wikipedia page image for a search query. */
async function fromWikipedia(query: string, size = 1000): Promise<string | null> {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&generator=search` +
    `&gsrsearch=${encodeURIComponent(query)}&gsrlimit=3` +
    `&prop=pageimages&piprop=thumbnail&pilicense=any&pilimit=3&format=json&pithumbsize=${size}&origin=*`;
  const data = await json(url);
  const pages = data?.query?.pages;
  if (!pages) return null;
  for (const page of Object.values<any>(pages)) {
    const src = page?.thumbnail?.source;
    if (isUsableUrl(src)) return src;
  }
  return null;
}

/** Wikimedia Commons file search — much broader coverage than article images. */
async function fromCommons(query: string, width = 1000): Promise<string | null> {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&generator=search` +
    `&gsrsearch=${encodeURIComponent(`${query} filetype:bitmap`)}&gsrnamespace=6&gsrlimit=5` +
    `&prop=imageinfo&iiprop=url&iiurlwidth=${width}&format=json&origin=*`;
  const data = await json(url);
  const pages = data?.query?.pages;
  if (!pages) return null;
  for (const page of Object.values<any>(pages)) {
    const info = page?.imageinfo?.[0];
    const src = info?.thumburl ?? info?.url;
    if (isUsableUrl(src) && !/\.svg$/i.test(src)) return src;
  }
  return null;
}

/** Openverse (CC search aggregator) — secondary source. */
async function fromOpenverse(query: string): Promise<string | null> {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=3&mature=false`;
  const data = await json(url);
  const first = data?.results?.find((r: any) => isUsableUrl(r?.thumbnail ?? r?.url));
  const src = first?.thumbnail ?? first?.url;
  return isUsableUrl(src) ? src : null;
}

/**
 * Resolves a photo for a specific place. Queries are always built as
 * "Place + Destination" first so that e.g. "Colosseum" resolves to the Roman
 * Colosseum and not to some unrelated article.
 */
export async function resolvePlaceImage(
  place: string,
  destination?: string,
): Promise<string | null> {
  const name = (place ?? "").trim();
  if (!name) return null;

  const key = cacheKey(name, destination);
  if (memoryCache.has(key)) return memoryCache.get(key) ?? null;
  const cached = readSession(key);
  if (cached !== undefined) {
    memoryCache.set(key, cached);
    return cached;
  }
  const running = inflight.get(key);
  if (running) return running;

  const dest = (destination ?? "").trim();
  const queries = dest && !name.toLowerCase().includes(dest.toLowerCase())
    ? [`${name} ${dest}`, name]
    : [name];

  const task = (async () => {
    for (const q of queries) {
      const wiki = await fromWikipedia(q);
      if (wiki) return wiki;
    }
    for (const q of queries) {
      const commons = await fromCommons(q);
      if (commons) return commons;
    }
    for (const q of queries) {
      const ov = await fromOpenverse(q);
      if (ov) return ov;
    }
    return null;
  })();

  inflight.set(key, task);
  const result = await task;
  inflight.delete(key);
  memoryCache.set(key, result);
  writeSession(key, result);
  return result;
}

/** Resolves the main cover photo for a destination (city/country). */
export async function resolveDestinationImage(destination: string): Promise<string | null> {
  const dest = (destination ?? "").trim();
  if (!dest) return null;
  const direct = await resolvePlaceImage(dest);
  if (direct) return direct;
  return resolvePlaceImage(`${dest} skyline cityscape`);
}

/** Batch resolver used by the trip page. Runs with limited concurrency. */
export async function fetchPlaceImages(
  placeNames: string[],
  destination?: string,
  concurrency = 6,
): Promise<Record<string, string | null>> {
  const unique = [...new Set(placeNames.map((n) => (n ?? "").trim()).filter(Boolean))];
  const out: Record<string, string | null> = {};
  let cursor = 0;

  async function worker() {
    while (cursor < unique.length) {
      const name = unique[cursor++];
      out[name] = await resolvePlaceImage(name, destination);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, unique.length) }, worker));
  return out;
}

/** Invalidates a cached URL that turned out to be broken at render time. */
export function invalidatePlaceImage(place: string, destination?: string) {
  const key = cacheKey(place, destination);
  memoryCache.delete(key);
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      /* non-fatal */
    }
  }
}
