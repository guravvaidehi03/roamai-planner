const cache = new Map<string, string | null>();

export async function fetchPlaceImage(placeName: string): Promise<string | null> {
  const key = placeName.toLowerCase().trim();
  if (cache.has(key)) return cache.get(key) ?? null;

  try {
    const url =
      `https://en.wikipedia.org/w/api.php?action=query&generator=search` +
      `&gsrsearch=${encodeURIComponent(placeName)}&gsrlimit=1` +
      `&prop=pageimages&format=json&pithumbsize=800&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data?.query?.pages;
    if (pages) {
      const firstPage = Object.values(pages)[0] as
        | { thumbnail?: { source: string } }
        | undefined;
      if (firstPage?.thumbnail?.source) {
        cache.set(key, firstPage.thumbnail.source);
        return firstPage.thumbnail.source;
      }
    }
  } catch {
    /* non-fatal */
  }
  cache.set(key, null);
  return null;
}

export async function fetchPlaceImages(
  placeNames: string[],
): Promise<Record<string, string | null>> {
  const unique = [...new Set(placeNames.filter(Boolean))];
  const entries = await Promise.all(
    unique.map(async (name) => [name, await fetchPlaceImage(name)] as const),
  );
  return Object.fromEntries(entries);
}
