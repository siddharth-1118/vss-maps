export interface WikipediaInfo {
  title: string;
  extract: string;
  thumbnailUrl?: string;
  pageUrl?: string;
}

export async function fetchWikipediaInfoForLocation(
  lat: number,
  lng: number
): Promise<WikipediaInfo | null> {
  try {
    // GeoSearch Wikipedia articles nearby
    const geoUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=10000&gslimit=1&format=json&origin=*`;
    const res = await fetch(geoUrl);
    if (!res.ok) return null;

    const data = await res.json();
    const searchResults = data?.query?.geosearch;
    if (!searchResults || searchResults.length === 0) return null;

    const title = searchResults[0].title;
    // Fetch summary & thumbnail for closest page
    const pageUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      title
    )}`;
    const pageRes = await fetch(pageUrl);
    if (!pageRes.ok) return null;

    const pageData = await pageRes.json();
    return {
      title: pageData.title || title,
      extract: pageData.extract || 'No description available.',
      thumbnailUrl: pageData.thumbnail?.source || pageData.originalimage?.source,
      pageUrl: pageData.content_urls?.desktop?.page,
    };
  } catch (err) {
    console.error('Wikipedia API fetch error:', err);
    return null;
  }
}
